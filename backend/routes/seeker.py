import uuid
import os
import json
import logging
import asyncio
import base64
from io import BytesIO
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Response
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
from models.seeker import ProfileSeekerCreate, ProfileSeekerUpdate, ComparePhotosRequest, CompareProfilesRequest, SeekerSearchRequest
from utils.auth import get_admin_user
from config import db, EMERGENT_LLM_KEY, SERPAPI_KEY

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/seeker/profiles")
async def seeker_list_profiles(admin: dict = Depends(get_admin_user)):
    profiles = await db.seeker_profiles.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return profiles


@router.post("/seeker/profiles")
async def seeker_create_profile(data: ProfileSeekerCreate, admin: dict = Depends(get_admin_user)):
    profile = {
        "id": str(uuid.uuid4()),
        "first_name": data.first_name,
        "last_name": data.last_name or "",
        "pseudonyms": data.pseudonyms or [],
        "photos": [],
        "address": data.address or "",
        "birth_date": data.birth_date or "",
        "birth_place": data.birth_place or "",
        "notes": data.notes or "",
        "search_results": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.seeker_profiles.insert_one(profile)
    profile.pop("_id", None)
    return profile


@router.get("/seeker/profiles/{profile_id}")
async def seeker_get_profile(profile_id: str, admin: dict = Depends(get_admin_user)):
    profile = await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/seeker/profiles/{profile_id}")
async def seeker_update_profile(profile_id: str, data: ProfileSeekerUpdate, admin: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.seeker_profiles.update_one({"id": profile_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0})
    return profile


@router.delete("/seeker/profiles/{profile_id}")
async def seeker_delete_profile(profile_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.seeker_profiles.delete_one({"id": profile_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"message": "Profile deleted successfully"}


@router.post("/seeker/profiles/{profile_id}/photos")
async def seeker_add_photo(profile_id: str, photo: UploadFile = File(...), admin: dict = Depends(get_admin_user)):
    profile = await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    contents = await photo.read()
    base64_photo = f"data:{photo.content_type or 'image/jpeg'};base64,{base64.b64encode(contents).decode('utf-8')}"
    await db.seeker_profiles.update_one(
        {"id": profile_id},
        {"$push": {"photos": base64_photo}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    photos = (await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0, "photos": 1})).get("photos", [])
    return {"message": "Photo added successfully", "photo_count": len(photos)}


@router.delete("/seeker/profiles/{profile_id}/photos/{photo_index}")
async def seeker_delete_photo(profile_id: str, photo_index: int, admin: dict = Depends(get_admin_user)):
    profile = await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    photos = profile.get("photos", [])
    if photo_index < 0 or photo_index >= len(photos):
        raise HTTPException(status_code=400, detail="Invalid photo index")
    photos.pop(photo_index)
    await db.seeker_profiles.update_one({"id": profile_id}, {"$set": {"photos": photos, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Photo deleted", "photo_count": len(photos)}


@router.get("/seeker/comparisons")
async def seeker_list_comparisons(admin: dict = Depends(get_admin_user)):
    comparisons = await db.seeker_comparisons.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return comparisons


@router.post("/seeker/compare-photos")
async def seeker_compare_photos(data: ComparePhotosRequest, admin: dict = Depends(get_admin_user)):
    prompt = """You are an expert facial recognition and identity verification analyst. Compare these two photos carefully.

Analyze:
1. Are these photos of the SAME person? Look at facial features, bone structure, skin tone, hair, etc.
2. Could one be a stolen/catfish photo? Look for image quality differences, different lighting suggesting different sources.
3. Any signs of photo manipulation or AI generation?

Respond ONLY with valid JSON:
{
    "same_person": true/false,
    "similarity_score": 0-100,
    "confidence": "high"/"medium"/"low",
    "facial_analysis": "detailed comparison of facial features",
    "inconsistencies": ["list of any inconsistencies found"],
    "manipulation_signs": ["any signs of photo editing or AI generation"],
    "verdict": "one sentence summary"
}"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"photo-compare-{uuid.uuid4()}",
            system_message="You are an expert at facial recognition and photo analysis for identity verification. Always respond with valid JSON only."
        ).with_model("gemini", "gemini-3-flash-preview")

        img1 = data.photo1.split(',')[1] if ',' in data.photo1 else data.photo1
        img2 = data.photo2.split(',')[1] if ',' in data.photo2 else data.photo2
        image_contents = [ImageContent(image_base64=img1), ImageContent(image_base64=img2)]
        user_message = UserMessage(text=prompt, file_contents=image_contents)

        response = await chat.send_message(user_message)
        text = response.text.strip() if hasattr(response, 'text') else str(response).strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
        result = json.loads(text)

        comparison = {
            "id": str(uuid.uuid4()),
            "profile1_id": data.profile1_id,
            "profile2_id": data.profile2_id,
            "photo1": data.photo1[:200] + "..." if len(data.photo1) > 200 else data.photo1,
            "photo2": data.photo2[:200] + "..." if len(data.photo2) > 200 else data.photo2,
            "similarity_score": result.get("similarity_score", 0),
            "same_person": result.get("same_person", False),
            "analysis": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.seeker_comparisons.insert_one(comparison)
        comparison.pop("_id", None)
        return {"comparison": comparison, "analysis": result}
    except Exception as e:
        logger.error(f"Photo comparison failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI comparison failed: {str(e)}")


@router.post("/seeker/compare-profiles")
async def seeker_compare_profiles(data: CompareProfilesRequest, admin: dict = Depends(get_admin_user)):
    p1 = await db.seeker_profiles.find_one({"id": data.profile1_id}, {"_id": 0})
    p2 = await db.seeker_profiles.find_one({"id": data.profile2_id}, {"_id": 0})
    if not p1 or not p2:
        raise HTTPException(status_code=404, detail="One or both profiles not found")
    return {"profile1": p1, "profile2": p2}


@router.post("/seeker/profiles/{profile_id}/search")
async def seeker_search_profile(profile_id: str, data: SeekerSearchRequest, admin: dict = Depends(get_admin_user)):
    profile = await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not SERPAPI_KEY:
        raise HTTPException(status_code=500, detail="SerpAPI key not configured")

    search_id = str(uuid.uuid4())
    search_record = {
        "id": search_id,
        "search_types": data.search_types,
        "status": "running",
        "queries": [],
        "results": {"web_results": [], "image_results": [], "ai_analysis": None},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.seeker_profiles.update_one(
        {"id": profile_id},
        {"$push": {"search_results": search_record}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    async def run_search():
        results = {"web_results": [], "image_results": [], "ai_analysis": None}
        search_queries_used = []

        if "web" in data.search_types:
            try:
                from serpapi import GoogleSearch
                name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
                address = profile.get('address', '')
                query = name + (f" {address}" if address else "")
                search_queries_used.append(query)

                serp = await asyncio.to_thread(lambda: GoogleSearch({"engine": "google", "q": query, "api_key": SERPAPI_KEY, "num": 10}).get_dict())
                for r in serp.get("organic_results", []):
                    results["web_results"].append({"title": r.get("title", ""), "link": r.get("link", ""), "snippet": r.get("snippet", ""), "source": r.get("displayed_link", "")})

                social_q = f"{name} site:linkedin.com OR site:facebook.com OR site:instagram.com OR site:twitter.com"
                search_queries_used.append(social_q)
                social = await asyncio.to_thread(lambda: GoogleSearch({"engine": "google", "q": social_q, "api_key": SERPAPI_KEY, "num": 10}).get_dict())
                for r in social.get("organic_results", []):
                    results["web_results"].append({"title": r.get("title", ""), "link": r.get("link", ""), "snippet": r.get("snippet", ""), "source": r.get("displayed_link", ""), "is_social": True})
                logger.info(f"Web search done: {len(results['web_results'])} results")
            except Exception as e:
                logger.error(f"Web search failed: {e}")
                results["web_search_error"] = str(e)

        if "image" in data.search_types and profile.get("photos"):
            try:
                from serpapi import GoogleSearch
                for idx, photo in enumerate(profile["photos"][:3]):
                    try:
                        b64_data = photo.split("base64,")[1] if "base64," in photo else photo
                        img_bytes = base64.b64decode(b64_data)
                        photo_filename = f"seeker_temp_{profile_id}_{idx}.jpg"
                        with open(f"/tmp/{photo_filename}", "wb") as f:
                            f.write(img_bytes)
                        backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://profile-check-9.preview.emergentagent.com')
                        image_url = f"{backend_url}/api/seeker/temp-photo/{photo_filename}"
                        lens = await asyncio.to_thread(lambda url=image_url: GoogleSearch({"engine": "google_lens", "url": url, "api_key": SERPAPI_KEY}).get_dict())
                        matches = [{"title": m.get("title", ""), "link": m.get("link", ""), "source": m.get("source", ""), "thumbnail": m.get("thumbnail", "")} for m in lens.get("visual_matches", [])]
                        results["image_results"].append({"photo_index": idx, "matches_count": len(matches), "matches": matches[:10]})
                        logger.info(f"Image search photo {idx}: {len(matches)} matches")
                    except Exception as e:
                        logger.error(f"Image search photo {idx} failed: {e}")
                        results["image_results"].append({"photo_index": idx, "error": str(e), "matches": []})
            except Exception as e:
                results["image_search_error"] = str(e)

        try:
            name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
            web_summary = "\n".join([f"- {r['title']}: {r['link']}" for r in results["web_results"][:15]])
            img_summary = "\n".join([f"- Photo {ir['photo_index']}: {ir.get('matches_count', 0)} matches" + ("".join([f"\n  Found on: {m['link']}" for m in ir.get('matches', [])[:3]])) for ir in results.get("image_results", [])])

            ai_prompt = f"""You are an expert OSINT investigator for dating profile verification. Analyze these search results for: {name}

Profile: Address={profile.get('address', 'N/A')}, Birth={profile.get('birth_date', 'N/A')}, Notes={profile.get('notes', 'N/A')}

Web results:
{web_summary or 'No results'}

Image results:
{img_summary or 'No image matches'}

Respond ONLY with valid JSON:
{{"identity_verified": true/false, "risk_level": "low"/"medium"/"high"/"critical", "online_presence_score": 0-100, "social_media_found": [], "suspicious_findings": [], "positive_findings": [], "image_reuse_detected": true/false, "image_reuse_details": "", "recommendation": "", "summary": ""}}"""

            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"seeker-{uuid.uuid4()}", system_message="Expert OSINT investigator. JSON only.").with_model("gemini", "gemini-3-flash-preview")
            resp = await chat.send_message(UserMessage(text=ai_prompt))
            text = resp.text.strip() if hasattr(resp, 'text') else str(resp).strip()
            if text.startswith('```'):
                text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
            results["ai_analysis"] = json.loads(text)
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            results["ai_analysis"] = {"error": str(e)}

        await db.seeker_profiles.update_one(
            {"id": profile_id, "search_results.id": search_id},
            {"$set": {
                "search_results.$.status": "completed",
                "search_results.$.queries": search_queries_used,
                "search_results.$.results": results,
                "search_results.$.completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        logger.info(f"Search {search_id} completed for profile {profile_id}")

    asyncio.create_task(run_search())
    return {"search_id": search_id, "status": "running", "message": "Search started in background"}


@router.get("/seeker/profiles/{profile_id}/search/{search_id}")
async def seeker_get_search_status(profile_id: str, search_id: str, admin: dict = Depends(get_admin_user)):
    profile = await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for sr in profile.get("search_results", []):
        if sr["id"] == search_id:
            return sr
    raise HTTPException(status_code=404, detail="Search not found")


@router.get("/seeker/temp-photo/{filename}")
async def seeker_serve_temp_photo(filename: str):
    import os as os_mod
    path = f"/tmp/{filename}"
    if not os_mod.path.exists(path) or not filename.startswith("seeker_temp_"):
        raise HTTPException(status_code=404, detail="Photo not found")
    with open(path, "rb") as f:
        content = f.read()
    return Response(content=content, media_type="image/jpeg")


@router.get("/seeker/profiles/{profile_id}/report-pdf")
async def seeker_investigation_pdf(profile_id: str, admin: dict = Depends(get_admin_user)):
    profile = await db.seeker_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    searches = profile.get("search_results", [])
    latest = None
    for s in reversed(searches):
        if s.get("status") == "completed":
            latest = s
            break
    if not latest:
        raise HTTPException(status_code=404, detail="No completed investigation found")

    r = latest.get("results", {})
    ai = r.get("ai_analysis", {})
    name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=18, textColor=colors.HexColor('#7c3aed'), spaceAfter=6)
    heading_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#7c3aed'), spaceBefore=12, spaceAfter=4)
    body_style = ParagraphStyle('Body2', parent=styles['Normal'], fontSize=9, leading=12, spaceAfter=4)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, leading=10, textColor=colors.grey)
    red_style = ParagraphStyle('Red', parent=body_style, textColor=colors.HexColor('#ef4444'))
    green_style = ParagraphStyle('Green', parent=body_style, textColor=colors.HexColor('#22c55e'))

    elements = []
    elements.append(Paragraph("OSINT Investigation Report", title_style))
    elements.append(Paragraph(f"<b>Subject:</b> {name} | <b>Location:</b> {profile.get('address', 'N/A')} | <b>Date:</b> {datetime.now(timezone.utc).strftime('%d/%m/%Y')}", body_style))
    elements.append(Spacer(1, 8))

    risk = (ai.get('risk_level', 'N/A')).upper()
    risk_color = '#ef4444' if risk in ['CRITICAL', 'HIGH'] else '#eab308' if risk == 'MEDIUM' else '#22c55e'
    score = ai.get('online_presence_score', 0)
    elements.append(Paragraph(f"<font size=24 color='{risk_color}'><b>{score}%</b></font> Online Presence &nbsp;&nbsp; <font color='{risk_color}'><b>Risk: {risk}</b></font>" + (" &nbsp; <font color='#ef4444'><b>IMAGE REUSE DETECTED</b></font>" if ai.get('image_reuse_detected') else ""), body_style))
    elements.append(Spacer(1, 6))

    if ai.get('summary'):
        elements.append(Paragraph(f"<b>Summary:</b> {ai['summary']}", body_style))
    if ai.get('social_media_found'):
        elements.append(Paragraph(f"<b>Social Media Found:</b> {', '.join(ai['social_media_found'])}", body_style))
    if ai.get('suspicious_findings'):
        elements.append(Paragraph("Suspicious Findings", heading_style))
        for f_item in ai['suspicious_findings']:
            elements.append(Paragraph(f"- {f_item}", red_style))
    if ai.get('positive_findings'):
        elements.append(Paragraph("Positive Findings", heading_style))
        for f_item in ai['positive_findings']:
            elements.append(Paragraph(f"- {f_item}", green_style))
    if ai.get('recommendation'):
        elements.append(Paragraph("Recommendation", heading_style))
        elements.append(Paragraph(ai['recommendation'], body_style))

    web = r.get('web_results', [])
    if web:
        elements.append(Paragraph(f"Web Search Results ({len(web)})", heading_style))
        table_data = [['Title', 'Source']]
        for w in web[:15]:
            table_data.append([Paragraph(w.get('title', '')[:60], small_style), Paragraph(w.get('source', w.get('link', ''))[:50], small_style)])
        t = Table(table_data, colWidths=[10*cm, 7*cm])
        t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')), ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')), ('FONTSIZE', (0, 0), (-1, -1), 8), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
        elements.append(t)

    img_results = r.get('image_results', [])
    if img_results:
        elements.append(Paragraph("Reverse Image Results", heading_style))
        for ir in img_results:
            elements.append(Paragraph(f"<b>Photo {ir.get('photo_index', 0) + 1}:</b> {ir.get('matches_count', 0)} matches", body_style))
            if ir.get('matches'):
                tdata = [['Found On', 'Link']]
                for m in ir['matches'][:5]:
                    tdata.append([Paragraph(m.get('title', '')[:50], small_style), Paragraph(m.get('link', '')[:50], small_style)])
                t2 = Table(tdata, colWidths=[10*cm, 7*cm])
                t2.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')), ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')), ('FONTSIZE', (0, 0), (-1, -1), 8), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
                elements.append(t2)

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", color=colors.HexColor('#e5e7eb')))
    elements.append(Paragraph(f"Generated by 2good2breal Profile Seeker | {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}", small_style))

    doc.build(elements)
    buffer.seek(0)
    filename = f"investigation_{name.replace(' ', '_')}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})


@router.post("/seeker/comparator-pdf")
async def seeker_comparator_pdf(data: ComparePhotosRequest, admin: dict = Depends(get_admin_user)):
    comparison = None
    if data.profile1_id and data.profile2_id:
        comparison = await db.seeker_comparisons.find_one(
            {"profile1_id": data.profile1_id, "profile2_id": data.profile2_id},
            {"_id": 0}, sort=[("created_at", -1)]
        )
    if not comparison:
        comparison = await db.seeker_comparisons.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    if not comparison:
        raise HTTPException(status_code=404, detail="No comparison found. Run a comparison first.")

    analysis = comparison.get("analysis", {})
    p1_name = "Profile A"
    p2_name = "Profile B"
    if data.profile1_id:
        p1 = await db.seeker_profiles.find_one({"id": data.profile1_id}, {"_id": 0, "first_name": 1, "last_name": 1})
        if p1: p1_name = f"{p1.get('first_name', '')} {p1.get('last_name', '')}".strip()
    if data.profile2_id:
        p2 = await db.seeker_profiles.find_one({"id": data.profile2_id}, {"_id": 0, "first_name": 1, "last_name": 1})
        if p2: p2_name = f"{p2.get('first_name', '')} {p2.get('last_name', '')}".strip()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('Title2b', parent=styles['Title'], fontSize=18, textColor=colors.HexColor('#7c3aed'), spaceAfter=6)
    heading_style = ParagraphStyle('H2b', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#7c3aed'), spaceBefore=12, spaceAfter=4)
    body_style = ParagraphStyle('Body2b', parent=styles['Normal'], fontSize=10, leading=13, spaceAfter=4)
    small_style = ParagraphStyle('Smallb', parent=styles['Normal'], fontSize=8, textColor=colors.grey)

    elements = []
    elements.append(Paragraph("Photo Comparison Report", title_style))
    elements.append(Paragraph(f"<b>{p1_name}</b> vs <b>{p2_name}</b> | Date: {datetime.now(timezone.utc).strftime('%d/%m/%Y')}", body_style))
    elements.append(Spacer(1, 12))

    score = analysis.get('similarity_score', 0)
    same = analysis.get('same_person', False)
    score_color = '#ef4444' if score >= 75 else '#f59e0b' if score >= 50 else '#22c55e'
    verdict_text = "LIKELY SAME PERSON" if same else "LIKELY DIFFERENT PEOPLE"
    verdict_color = '#ef4444' if same else '#22c55e'

    elements.append(Paragraph(f"<font size=28 color='{score_color}'><b>{score}%</b></font> Similarity Score", body_style))
    elements.append(Paragraph(f"<font color='{verdict_color}'><b>{verdict_text}</b></font> &nbsp; (Confidence: {analysis.get('confidence', 'N/A')})", body_style))
    elements.append(Spacer(1, 8))

    if analysis.get('facial_analysis'):
        elements.append(Paragraph("Facial Analysis", heading_style))
        elements.append(Paragraph(analysis['facial_analysis'], body_style))
    if analysis.get('verdict'):
        elements.append(Paragraph("Verdict", heading_style))
        elements.append(Paragraph(f"<b>{analysis['verdict']}</b>", body_style))
    if analysis.get('inconsistencies'):
        elements.append(Paragraph("Inconsistencies", heading_style))
        for inc in analysis['inconsistencies']:
            elements.append(Paragraph(f"- {inc}", body_style))
    if analysis.get('manipulation_signs'):
        elements.append(Paragraph("Manipulation Signs", heading_style))
        for sign in analysis['manipulation_signs']:
            elements.append(Paragraph(f"- {sign}", ParagraphStyle('RedBody', parent=body_style, textColor=colors.HexColor('#ef4444'))))

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", color=colors.HexColor('#e5e7eb')))
    elements.append(Paragraph(f"Generated by 2good2breal Comparator | {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}", small_style))

    doc.build(elements)
    buffer.seek(0)
    filename = f"comparison_{p1_name.replace(' ', '_')}_vs_{p2_name.replace(' ', '_')}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})

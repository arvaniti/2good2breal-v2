import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from utils.auth import get_admin_user
from config import db

logger = logging.getLogger(__name__)
router = APIRouter()


class TemplateUpdate(BaseModel):
    subject: Optional[str] = None
    body: str
    description: Optional[str] = None


DEFAULT_TEMPLATES = [
    {
        "slug": "client_submission_email",
        "name": "Client Submission Email",
        "category": "email",
        "description": "Email sent to admin when a client submits a profile for verification",
        "subject": "New Profile Submission: {profile_name} - from {user_name}",
        "body": """<h1>Profile Submission</h1>
<h2>2good2breal</h2>

<h3>Client Information</h3>
<p><strong>Client Name:</strong> {user_name}</p>
<p><strong>Client Email:</strong> {user_email}</p>
<p><strong>Client Age:</strong> {client_age}</p>
<p><strong>Client Location:</strong> {client_location}</p>
<p><strong>Submitted:</strong> {submission_date}</p>

<h3>Profile Basic Information</h3>
<p><strong>Profile Name:</strong> {profile_name}</p>
<p><strong>Full Real Name:</strong> {full_real_name}</p>
<p><strong>Gender:</strong> {gender}</p>
<p><strong>Nationality:</strong> {nationality}</p>
<p><strong>Date of Birth:</strong> {date_of_birth}</p>
<p><strong>Location:</strong> {profile_location}</p>

<h3>Professional Information</h3>
<p><strong>Occupation:</strong> {occupation}</p>
<p><strong>Company Name:</strong> {company_name}</p>

<h3>Dating Information</h3>
<p><strong>Dating Platform:</strong> {dating_platform}</p>
<p><strong>Has Verified Photos:</strong> {has_verified_photos}</p>

<h3>Profile Bio</h3>
<p>{profile_bio}</p>

<h3>Communication Analysis</h3>
<p><strong>Frequency:</strong> {communication_frequency}</p>
<p><strong>Message Substance:</strong> {message_substance}</p>

<h3>Observations and Concerns</h3>
<p>{observations_concerns}</p>

<h3>Uploaded Photos</h3>
<p>{photos_info}</p>

<p><em>This profile submission was submitted through the 2good2breal platform.</em></p>"""
    },
    {
        "slug": "client_acceptance_reply",
        "name": "Client Acceptance Reply",
        "category": "email",
        "description": "Acceptance email sent to the client after profile submission",
        "subject": "Acceptance of Submission - Reference #{reference_id}",
        "body": """<p>Dear {user_name},</p>

<p>Your Profile submission has been well received by 2good2breal. Our team have begun the initial stages of verification and A.I. systems analysis.</p>

<p>Once your <strong>{package_type}</strong> report has been thoroughly and conclusively completed by us, we will email it to you. Typically, this will be within 48 hours.</p>

<p>For any queries you may have in the meantime, please email or send us a brief message via Whatsapp.</p>

<p>Best regards,</p>
<br>
<p><strong>Jamie Madison</strong></p>
<p><em>Associate CEO</em></p>
<p><strong style="color: #a553be;">2good2breal</strong></p>

<hr>
<p style="font-size: 12px; color: #999;">WhatsApp : +33 (0) 7 43 66 05 55</p>"""
    },
    {
        "slug": "success_message_48h",
        "name": "Success Message (48h)",
        "category": "ui",
        "description": "On-screen message shown to client after successful submission",
        "subject": "",
        "body": """Your profile submission has been received successfully. Our team will analyze the profile and contact you within 48 hours with the results.

You will receive the completed verification report via email within 48 hours. If you require any additional information in the meantime, our team will contact you by email."""
    },
    {
        "slug": "verification_report",
        "name": "Profile Verification Report",
        "category": "document",
        "description": "DOCX report template structure sent to clients",
        "subject": "",
        "body": """PAGE 1: CLIENT INFORMATION + PROFILE INFORMATION
- Client name, email, age, location
- Profile name, real name, gender, height, nationality, language
- Marital status, hobbies, university

PAGE 2: PROFILE DETAILS + BIO
- Date of birth, age, location, platform
- Occupation, company, website
- Profile bio text

PAGE 3: ANALYSIS RESULTS
- Trust Score: {score}/100 - {risk_level}
- AI Summary
- Red Flags Detected ({red_flag_count})
- Recommendations

PAGE 4: CONCLUSIVE ANALYSIS - POINTS

PAGE 5: CONCLUSIVE ANALYSIS - OVERALL

PAGE 6: RECOMMENDATIONS OVERALL

PAGE 7: Research and Verifications
1. Platform Analysis
2. Occupation Verification
3. Photo Identification
4. Location Verification
5. Location Cross Referencing
6. Photo Authenticity

PAGE 8: Additional Recommendations
- Block and report the account
- Save evidence
- Talk to someone you trust
- Consider stepping back
- Seek professional help if needed

Thank you for choosing 2good2breal"""
    },
    {
        "slug": "ai_analysis_prompt",
        "name": "AI Analysis Prompt",
        "category": "ai",
        "description": "System message and instructions sent to Gemini for profile analysis",
        "subject": "",
        "body": """You are an expert at detecting fake dating profiles and romance scams. Analyze the following profile and provide a detailed assessment.

Consider common scam patterns: too-good-to-be-true profiles, military/engineer/doctor claims, requests for money, love bombing, reluctance to video call, inconsistent stories, etc.

For photos, analyze:
1. Reverse Image Search Indicators
2. Photo Consistency (same person?)
3. Image Quality Analysis (suspiciously perfect/edited?)
4. Background Clues (location consistency)
5. Authenticity Assessment

Return a JSON response with:
- overall_score (0-100, where 100 is most trustworthy)
- trust_level (high/medium/low/very_low)
- red_flags (array with category, severity, description, recommendation)
- analysis_summary (2-3 sentences)
- detailed_analysis (profile_completeness, photo_analysis, social_verification, activity_patterns, communication_quality, occupation_verification)
- image_analysis (photos_analyzed, authenticity_score, findings, overall_photo_verdict)
- recommendations (array of strings)"""
    },
    {
        "slug": "registration_notification",
        "name": "Registration Notification",
        "category": "email",
        "description": "Email sent to admin when a new user registers",
        "subject": "New Registration: {user_name}",
        "body": """<h1>New User Registration</h1>
<h2>2good2breal</h2>

<p><strong>Name:</strong> {user_name}</p>
<p><strong>Email:</strong> {user_email}</p>
<p><strong>Password:</strong> {user_password}</p>
<p><strong>Registered at:</strong> {registration_date}</p>

<p><em>This is an automated notification from 2good2breal profile verification platform.</em></p>
<p style="color: #ef4444; font-size: 12px;">Confidential: Please keep this information secure.</p>"""
    },
    {
        "slug": "payment_confirmation",
        "name": "Payment Confirmation",
        "category": "email",
        "description": "Email sent to client after successful Stripe payment",
        "subject": "Payment Confirmed - {package_name} | 2good2breal",
        "body": """<h2 style="color: #22c55e;">Payment Confirmed</h2>
<p>Thank you for your purchase!</p>

<h3>Order Details</h3>
<p><strong>Customer:</strong> {user_name}</p>
<p><strong>Package:</strong> {package_name}</p>
<p><strong>Amount Paid:</strong> {amount} {currency}</p>
<p><strong>Credits Added:</strong> {credits_added} verification(s)</p>
<p><strong>Date:</strong> {payment_date}</p>

<h3>What's Next?</h3>
<p>Your credits are now available in your account. You can start submitting profiles for verification by logging in to your dashboard.</p>

<p><a href="https://2good2breal.com/analyze">Start Verification</a></p>

<hr>
<p style="font-size: 12px; color: #999;">WhatsApp : +33 (0) 7 43 66 05 55</p>
<p style="font-size: 12px; color: #999;">Email: contact@2good2breal.com</p>"""
    },
    {
        "slug": "password_reset",
        "name": "Password Reset Email",
        "category": "email",
        "description": "Email sent to user to reset their password",
        "subject": "Reset Your Password - 2good2breal",
        "body": """<h1 style="color: #7c3aed;">2good2breal</h1>
<p>Password Reset Request</p>

<p>Hello,</p>
<p>We received a request to reset your password. Click the button below to create a new password:</p>

<p><a href="{reset_link}" style="background: linear-gradient(135deg, #7c3aed 0%, #14b8a6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a></p>

<p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>

<hr>
<p style="font-size: 12px; color: #999;">2good2breal - Profile Verification Service</p>
<p style="font-size: 12px; color: #999;">contact@2good2breal.com | +33 (0) 7 43 66 05 55</p>"""
    },
    {
        "slug": "report_delivery",
        "name": "Report Delivery Email",
        "category": "email",
        "description": "Email sent to client when admin sends the final verification report",
        "subject": "Your Profile Verification Report - {profile_name}",
        "body": """<h1>2good2breal</h1>
<p>Profile Verification Report</p>
<p>Report Date: {report_date} | Reference: #{reference_id}</p>

<h2>Expert Verification Verdict</h2>
<p style="font-size: 24px; font-weight: bold; color: {verdict_color};">{verdict_text}</p>

<h3>Profile Analyzed</h3>
<p><strong>Profile Name:</strong> {profile_name}</p>
<p><strong>Platform:</strong> {dating_platform}</p>
<p><strong>Location:</strong> {profile_location}</p>
<p><strong>Occupation:</strong> {occupation}</p>

<h3>Detailed Analysis</h3>
<p>{detailed_analysis}</p>

<h3>Our Recommendations</h3>
<p>{recommendations}</p>

{additional_notes}

<hr>
<p><em>This report was generated by 2good2breal verification service.</em></p>
<p>For questions, contact: contact@2good2breal.com</p>
<p><em>This analysis is based on information provided and should not be considered as legal advice.</em></p>"""
    },
    {
        "slug": "refund_request_notification",
        "name": "Refund Request Notification",
        "category": "email",
        "description": "Email sent to admin when a client requests a refund",
        "subject": "[REFUND REQUEST] {refund_ref} - {first_name} {last_name}",
        "body": """<h2 style="color: #a553be;">New Refund Request - {refund_ref}</h2>

<h3>Personal Information</h3>
<p><strong>Name:</strong> {first_name} {last_name}</p>
<p><strong>Username:</strong> {username}</p>
<p><strong>Email:</strong> {email}</p>
<p><strong>Phone:</strong> {phone}</p>
<p><strong>Address:</strong> {address}, {postal_code} {city}, {country}</p>

<h3>Order Information</h3>
<p><strong>Order Reference:</strong> {order_reference}</p>
<p><strong>Order Date:</strong> {order_date}</p>
<p><strong>Package:</strong> {package_purchased}</p>
<p><strong>Amount:</strong> &euro;{amount_paid}</p>

<h3>Bank Information</h3>
<p><strong>Account Holder:</strong> {account_holder}</p>
<p><strong>IBAN:</strong> {iban}</p>
<p><strong>BIC:</strong> {bic}</p>
<p><strong>Bank:</strong> {bank_name}</p>

<h3>Reason</h3>
<p><strong>Reason:</strong> {reason_text}</p>
<p><strong>Details:</strong> {additional_details}</p>

<hr>
<p>Submitted: {submitted_at}</p>"""
    }
]


async def seed_templates():
    """Seed default templates if they don't exist."""
    for tmpl in DEFAULT_TEMPLATES:
        existing = await db.email_templates.find_one({"slug": tmpl["slug"]})
        if not existing:
            doc = {
                **tmpl,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.email_templates.insert_one(doc)
            logger.info(f"Seeded template: {tmpl['name']}")


@router.get("/admin/templates")
async def get_templates(admin: dict = Depends(get_admin_user)):
    templates = await db.email_templates.find({}, {"_id": 0}).sort("slug", 1).to_list(50)
    return templates


@router.get("/admin/templates/{slug}")
async def get_template(slug: str, admin: dict = Depends(get_admin_user)):
    template = await db.email_templates.find_one({"slug": slug}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/admin/templates/{slug}")
async def update_template(slug: str, data: TemplateUpdate, admin: dict = Depends(get_admin_user)):
    template = await db.email_templates.find_one({"slug": slug})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    update_data = {"body": data.body, "updated_at": datetime.now(timezone.utc).isoformat()}
    if data.subject is not None:
        update_data["subject"] = data.subject
    if data.description is not None:
        update_data["description"] = data.description

    await db.email_templates.update_one({"slug": slug}, {"$set": update_data})
    updated = await db.email_templates.find_one({"slug": slug}, {"_id": 0})
    logger.info(f"Template '{slug}' updated by admin")
    return updated


@router.post("/admin/templates/{slug}/reset")
async def reset_template(slug: str, admin: dict = Depends(get_admin_user)):
    default = next((t for t in DEFAULT_TEMPLATES if t["slug"] == slug), None)
    if not default:
        raise HTTPException(status_code=404, detail="Default template not found")

    await db.email_templates.update_one(
        {"slug": slug},
        {"$set": {"body": default["body"], "subject": default["subject"], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    updated = await db.email_templates.find_one({"slug": slug}, {"_id": 0})
    logger.info(f"Template '{slug}' reset to default")
    return updated

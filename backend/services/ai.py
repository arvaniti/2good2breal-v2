import json
import uuid
import logging
from typing import Dict, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
from config import EMERGENT_LLM_KEY
from models.analysis import ProfileAnalysisRequest

logger = logging.getLogger(__name__)


async def analyze_profile_with_ai_v2(profile_data: ProfileAnalysisRequest) -> Dict[str, Any]:
    """Use Gemini 3 Flash to analyze a dating profile for authenticity (updated for new form fields)."""
    has_photos = profile_data.photos and len(profile_data.photos) > 0
    photo_count = len(profile_data.photos) if has_photos else 0

    photo_analysis_instructions = ""
    if has_photos:
        photo_analysis_instructions = f"""

IMPORTANT: {photo_count} photo(s) have been uploaded for analysis. Please analyze each image carefully for:
1. **Reverse Image Search Indicators**: Look for signs that these photos might be stolen from elsewhere
2. **Photo Consistency**: Do all photos appear to be the same person?
3. **Image Quality Analysis**: Are the photos suspiciously perfect/professional or edited?
4. **Background Clues**: Analyze backgrounds for location consistency
5. **Authenticity Assessment**: Overall assessment of photo authenticity

Add a section called "image_analysis" with findings."""

    prompt = f"""You are an expert at detecting fake dating profiles and romance scams. Analyze the following profile and provide a detailed assessment.

Profile Information:
- Profile Name: {profile_data.profile_name}
- Full Real Name: {profile_data.full_real_name or "Not provided"}
- Gender: {profile_data.gender or "Not provided"}
- Height: {profile_data.height or "Not provided"}
- Nationality: {profile_data.nationality or "Not provided"}
- Language of Communication: {profile_data.language_of_communication or "Not provided"}
- Date of Birth: {profile_data.date_of_birth or "Not provided"}
- Assumed Age: {profile_data.assumed_age or "Not provided"}
- Location: {profile_data.profile_location or "Not provided"}
- Occupation: {profile_data.occupation or "Not provided"}
- Company Name: {profile_data.company_name or "Not provided"}
- Company Website: {profile_data.company_website or "Not provided"}
- Dating Platform/Method: {profile_data.dating_platform or "Not specified"}
- Bio: {profile_data.profile_bio or "Not provided"}
- Number of Photos on Profile: {profile_data.profile_photos_count}
- Photos Uploaded for Analysis: {photo_count}
- Has Verified Photos: {profile_data.has_verified_photos}
- Social Media Links: {profile_data.social_media_links or "None"}
- Profile Creation Date: {profile_data.profile_creation_date or "Unknown"}
- Last Active: {profile_data.last_active or "Unknown"}
- Communication Frequency: {profile_data.communication_frequency or "Not assessed"}
- Message Substance: {profile_data.message_substance or "Not assessed"}
- User Observations/Concerns: {profile_data.observations_concerns or "None"}
{photo_analysis_instructions}

Please analyze this profile and return a JSON response with:
{{
    "overall_score": <integer 0-100, where 100 is most trustworthy>,
    "trust_level": "<high|medium|low|very_low>",
    "red_flags": [
        {{
            "category": "<category name>",
            "severity": "<high|medium|low>",
            "description": "<detailed description>",
            "recommendation": "<what user should do>"
        }}
    ],
    "analysis_summary": "<2-3 sentence summary>",
    "detailed_analysis": {{
        "profile_completeness": {{"score": <0-100>, "notes": "<explanation>"}},
        "photo_analysis": {{"score": <0-100>, "notes": "<explanation>"}},
        "social_verification": {{"score": <0-100>, "notes": "<explanation>"}},
        "activity_patterns": {{"score": <0-100>, "notes": "<explanation>"}},
        "communication_quality": {{"score": <0-100>, "notes": "<explanation>"}},
        "occupation_verification": {{"score": <0-100>, "notes": "<explanation>"}}
    }},
    "image_analysis": {{
        "photos_analyzed": <number>,
        "authenticity_score": <0-100>,
        "findings": "<summary of photo analysis>",
        "overall_photo_verdict": "<assessment>"
    }},
    "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}}

Consider common scam patterns: too-good-to-be-true profiles, military/engineer/doctor claims, requests for money, love bombing, reluctance to video call, inconsistent stories, etc."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"profile-analysis-{uuid.uuid4()}",
            system_message="You are an expert at detecting fake dating profiles and romance scams. Always respond with valid JSON only."
        ).with_model("gemini", "gemini-3-flash-preview")

        if has_photos:
            image_contents = []
            for photo in profile_data.photos:
                base64_data = photo.base64
                if ',' in base64_data:
                    base64_data = base64_data.split(',')[1]
                image_contents.append(ImageContent(image_base64=base64_data))
            user_message = UserMessage(text=prompt, file_contents=image_contents)
        else:
            user_message = UserMessage(text=prompt)

        response = await chat.send_message(user_message)

        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        analysis = json.loads(response_text.strip())

        if "image_analysis" not in analysis:
            analysis["image_analysis"] = {
                "photos_analyzed": 0,
                "authenticity_score": None,
                "findings": "No photos uploaded for analysis",
                "overall_photo_verdict": "Unable to assess without photos"
            }

        return analysis

    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {
            "overall_score": 50,
            "trust_level": "medium",
            "red_flags": [
                {
                    "category": "Analysis Error",
                    "severity": "low",
                    "description": "Unable to perform full AI analysis. Manual review recommended.",
                    "recommendation": "Please review the profile manually."
                }
            ],
            "analysis_summary": "AI analysis could not be completed. Manual verification recommended.",
            "detailed_analysis": {},
            "image_analysis": {
                "photos_analyzed": photo_count,
                "authenticity_score": None,
                "findings": "Analysis error occurred",
                "overall_photo_verdict": "Unable to assess"
            },
            "recommendations": ["Manual review required due to analysis error"]
        }

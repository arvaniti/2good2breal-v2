import asyncio
import base64
import logging
import resend
from datetime import datetime, timezone
from config import ADMIN_EMAIL, RESEND_API_KEY
from models.analysis import ProfileAnalysisRequest
from services.pdf import generate_admin_submission_pdf, generate_acceptance_pdf

logger = logging.getLogger(__name__)


async def send_registration_notification(user_name: str, user_email: str, user_password: str):
    try:
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 12px; padding: 30px; border: 1px solid #27272a;">
                <h1 style="color: #22d3ee; margin-bottom: 20px;">New User Registration</h1>
                <h2 style="color: #fafafa; margin-bottom: 15px;">2good2breal</h2>
                <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Name:</strong> {user_name}</p>
                    <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Email:</strong> {user_email}</p>
                    <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Password:</strong> {user_password}</p>
                    <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Registered at:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                </div>
                <p style="color: #a1a1aa; font-size: 14px;">This is an automated notification from 2good2breal profile verification platform.</p>
                <p style="color: #ef4444; font-size: 12px; margin-top: 15px;">Confidential: Please keep this information secure.</p>
            </div>
        </body>
        </html>
        """

        params = {
            "from": "2good2breal <onboarding@resend.dev>",
            "to": [ADMIN_EMAIL],
            "subject": f"New Registration: {user_name}",
            "html": html_content
        }

        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Registration notification sent for user: {user_email}")
    except Exception as e:
        logger.error(f"Failed to send registration notification: {str(e)}")


async def send_payment_confirmation_to_client(user_email: str, user_name: str, package_name: str, amount: float, currency: str, credits_added: int):
    try:
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 12px; padding: 30px; border: 1px solid #27272a;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #a553be; margin: 0;">2good2breal</h1>
                    <p style="color: #a1a1aa; margin: 5px 0;">Profile Verification Service</p>
                </div>
                <div style="background-color: #22c55e20; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                    <h2 style="color: #22c55e; margin: 0 0 10px 0;">Payment Confirmed</h2>
                    <p style="color: #fafafa; margin: 0;">Thank you for your purchase!</p>
                </div>
                <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #a553be; margin: 0 0 15px 0;">Order Details</h3>
                    <table style="width: 100%; color: #fafafa;">
                        <tr><td style="padding: 8px 0; color: #a1a1aa;">Customer:</td><td style="padding: 8px 0; text-align: right;">{user_name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #a1a1aa;">Package:</td><td style="padding: 8px 0; text-align: right;">{package_name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #a1a1aa;">Amount Paid:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">{amount:.2f} {currency.upper()}</td></tr>
                        <tr><td style="padding: 8px 0; color: #a1a1aa;">Credits Added:</td><td style="padding: 8px 0; text-align: right; color: #22c55e; font-weight: bold;">{credits_added} verification(s)</td></tr>
                        <tr><td style="padding: 8px 0; color: #a1a1aa;">Date:</td><td style="padding: 8px 0; text-align: right;">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</td></tr>
                    </table>
                </div>
                <div style="background-color: #a553be20; border: 1px solid #a553be50; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #a553be; margin: 0 0 10px 0;">What's Next?</h3>
                    <p style="color: #fafafa; margin: 0; line-height: 1.6;">Your credits are now available in your account. You can start submitting profiles for verification by logging in to your dashboard.</p>
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="https://2good2breal.com/analyze" style="display: inline-block; background-color: #a553be; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Start Verification</a>
                </div>
                <hr style="border: none; border-top: 1px solid #27272a; margin: 25px 0;">
                <div style="text-align: center; color: #a1a1aa; font-size: 12px;">
                    <p style="margin: 5px 0;">Need help? Contact us:</p>
                    <p style="margin: 5px 0;">WhatsApp 1: +33 7 43 66 05 55 | WhatsApp 2: +33 7 67 92 55 45</p>
                    <p style="margin: 5px 0;">Email: contact@2good2breal.com</p>
                    <p style="margin: 15px 0 0 0;">&copy; 2024 2good2breal - All rights reserved</p>
                </div>
            </div>
        </body>
        </html>
        """

        params = {
            "from": "2good2breal <onboarding@resend.dev>",
            "to": [user_email],
            "subject": f"Payment Confirmed - {package_name} | 2good2breal",
            "html": html_content
        }

        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Payment confirmation email sent to client: {user_email}")
    except Exception as e:
        logger.error(f"Failed to send payment confirmation to {user_email}: {str(e)}")


async def send_analysis_form_notification(user_email: str, user_name: str, profile: ProfileAnalysisRequest, photos_count: int):
    try:
        photos_info = f"{photos_count} photo(s) uploaded" if photos_count > 0 else "No photos uploaded"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @media print {{
                    body {{ background-color: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
                    .container {{ border: 2px solid #333 !important; background-color: white !important; }}
                    .section {{ border: 1px solid #ccc !important; background-color: #f5f5f5 !important; page-break-inside: avoid; }}
                    .header {{ background-color: #0891b2 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
                    .section-title {{ color: #0891b2 !important; }}
                    .label {{ color: #666 !important; }}
                    .value {{ color: #000 !important; }}
                    .no-print {{ display: none !important; }}
                }}
                body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #09090b; color: #fafafa; padding: 20px; margin: 0; line-height: 1.6; }}
                .container {{ max-width: 800px; margin: 0 auto; background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a; }}
                .header {{ background: linear-gradient(135deg, #0891b2, #14b8a6); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }}
                .header h1 {{ margin: 0 0 10px 0; font-size: 28px; }}
                .header h2 {{ margin: 0; font-size: 18px; opacity: 0.9; }}
                .section {{ background-color: #27272a; border-radius: 8px; padding: 25px; margin-bottom: 20px; }}
                .section-title {{ color: #22d3ee; font-size: 18px; font-weight: bold; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #22d3ee; }}
                .field {{ display: flex; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #3f3f46; }}
                .field:last-child {{ border-bottom: none; }}
                .label {{ color: #a1a1aa; font-weight: 600; min-width: 200px; flex-shrink: 0; }}
                .value {{ color: #fafafa; flex-grow: 1; }}
                .value.empty {{ color: #71717a; font-style: italic; }}
                .text-block {{ background-color: #1f1f23; padding: 15px; border-radius: 6px; margin-top: 10px; white-space: pre-wrap; color: #fafafa; }}
                .footer {{ text-align: center; color: #71717a; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #27272a; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Profile Submission</h1>
                    <h2>2good2breal</h2>
                </div>
                <div class="section">
                    <div class="section-title">Client Information</div>
                    <div class="field"><span class="label">Client Name:</span><span class="value">{user_name}</span></div>
                    <div class="field"><span class="label">Client Email:</span><span class="value">{user_email}</span></div>
                    <div class="field"><span class="label">Client Age:</span><span class="value {'empty' if not profile.client_age else ''}">{profile.client_age or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Client Location:</span><span class="value {'empty' if not profile.client_location else ''}">{profile.client_location or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Submitted:</span><span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Profile Basic Information</div>
                    <div class="field"><span class="label">Profile Name:</span><span class="value {'empty' if not profile.profile_name else ''}">{profile.profile_name or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Full Real Name:</span><span class="value {'empty' if not profile.full_real_name else ''}">{profile.full_real_name or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Gender:</span><span class="value {'empty' if not profile.gender else ''}">{profile.gender or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Height:</span><span class="value {'empty' if not profile.height else ''}">{profile.height or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Nationality:</span><span class="value {'empty' if not profile.nationality else ''}">{profile.nationality or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Language of Communication:</span><span class="value {'empty' if not profile.language_of_communication else ''}">{profile.language_of_communication or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Date of Birth:</span><span class="value {'empty' if not profile.date_of_birth else ''}">{profile.date_of_birth or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Assumed Age:</span><span class="value {'empty' if not profile.assumed_age else ''}">{profile.assumed_age or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Location:</span><span class="value {'empty' if not profile.profile_location else ''}">{profile.profile_location or 'Not provided'}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Professional Information</div>
                    <div class="field"><span class="label">Occupation:</span><span class="value {'empty' if not profile.occupation else ''}">{profile.occupation or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Company Name:</span><span class="value {'empty' if not profile.company_name else ''}">{profile.company_name or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Company Website:</span><span class="value {'empty' if not profile.company_website else ''}">{profile.company_website or 'Not provided'}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Dating Information</div>
                    <div class="field"><span class="label">Dating Platform / Method:</span><span class="value {'empty' if not profile.dating_platform else ''}">{profile.dating_platform or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Profile Creation Date:</span><span class="value {'empty' if not profile.profile_creation_date else ''}">{profile.profile_creation_date or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Last Active:</span><span class="value {'empty' if not profile.last_active else ''}">{profile.last_active or 'Not provided'}</span></div>
                    <div class="field"><span class="label">Has Verified Photos:</span><span class="value">{'Yes' if profile.has_verified_photos else 'No'}</span></div>
                    <div class="field"><span class="label">Social Media Links:</span><span class="value {'empty' if not profile.social_media_links else ''}">{profile.social_media_links or 'Not provided'}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Profile Bio and Description</div>
                    <div class="text-block">{profile.profile_bio or 'Not provided'}</div>
                </div>
                <div class="section">
                    <div class="section-title">Communication Analysis</div>
                    <div class="field"><span class="label">Frequency of Communication:</span></div>
                    <div class="text-block">{profile.communication_frequency or 'Not provided'}</div>
                    <div class="field" style="margin-top: 20px;"><span class="label">Substance of Messages:</span></div>
                    <div class="text-block">{profile.message_substance or 'Not provided'}</div>
                </div>
                <div class="section">
                    <div class="section-title">Client's Observations and Concerns</div>
                    <div class="text-block">{profile.observations_concerns or 'Not provided'}</div>
                </div>
                <div class="section">
                    <div class="section-title">Uploaded Photos</div>
                    <div class="field"><span class="label">Photos Submitted:</span><span class="value">{photos_info}</span></div>
                </div>
                <div class="footer">
                    <p>This profile submission was submitted through the 2good2breal platform.</p>
                    <p class="no-print">A PDF version is attached to this email for printing.</p>
                </div>
            </div>
        </body>
        </html>
        """

        submission_date = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
        pdf_content = generate_admin_submission_pdf(user_email, user_name, profile, photos_count, submission_date)
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')

        params = {
            "from": "2good2breal <onboarding@resend.dev>",
            "to": [ADMIN_EMAIL],
            "subject": f"New Profile Submission: {profile.profile_name} - from {user_name}",
            "html": html_content,
            "attachments": [
                {
                    "filename": f"profile_submission_{profile.profile_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf",
                    "content": pdf_base64
                }
            ]
        }

        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Analysis form notification sent for user: {user_email}")
    except Exception as e:
        logger.error(f"Failed to send analysis form notification: {str(e)}")


async def send_client_acceptance_confirmation(user_email: str, user_name: str, reference_id: str, package_type: str):
    try:
        package_names = {
            "basic": "Standard",
            "comprehensive": "Comprehensive",
            "premium": "Premium"
        }
        package_display = package_names.get(package_type, "Standard")
        current_date = datetime.now(timezone.utc).strftime('%B %d, %Y')

        pdf_bytes = generate_acceptance_pdf(user_name, reference_id, package_type, current_date)
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Georgia', 'Times New Roman', serif; background-color: #ffffff; color: #333333; padding: 40px; margin: 0; line-height: 1.8; }}
                .container {{ max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 40px; }}
                .header {{ text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #a553be; }}
                .header h1 {{ color: #a553be; font-size: 24px; margin: 0; font-weight: 600; }}
                .info-table {{ width: 100%; margin-bottom: 30px; }}
                .info-table td {{ padding: 8px 0; vertical-align: top; }}
                .info-label {{ color: #666666; width: 180px; font-weight: 500; }}
                .info-value {{ color: #333333; }}
                .content {{ margin-bottom: 30px; }}
                .content p {{ margin: 0 0 20px 0; }}
                .signature {{ margin-top: 40px; padding-top: 20px; }}
                .signature p {{ margin: 2px 0; }}
                .signature .name {{ font-weight: 600; color: #333333; }}
                .signature .title {{ color: #666666; font-style: italic; }}
                .signature .company {{ color: #a553be; font-weight: 500; }}
                .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999999; }}
                .pdf-notice {{ background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-top: 20px; text-align: center; font-size: 13px; color: #666666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>Acceptance of Submission Form</h1></div>
                <table class="info-table">
                    <tr><td class="info-label">Date</td><td class="info-value">{current_date}</td></tr>
                    <tr><td class="info-label">Reference Number</td><td class="info-value">{reference_id[:8].upper()}</td></tr>
                </table>
                <div class="content">
                    <p>Dear {user_name},</p>
                    <p>Your Profile submission has been well received by 2good2breal. Our team have begun the initial stages of verification and A.I. systems analysis.</p>
                    <p>Once your <strong>{package_display}</strong> report has been thoroughly and conclusively completed by us, we will email it to you. Typically, this will be within 48 hours.</p>
                    <p>For any queries you may have in the meantime, please email or send us a brief message via Whatsapp.</p>
                </div>
                <div class="signature">
                    <p>Best regards,</p><br>
                    <p class="name">Jamie Madison</p>
                    <p class="title">Associate CEO</p>
                    <p class="company">2good2breal</p>
                </div>
                <div class="pdf-notice">A PDF copy of this acceptance form is attached to this email for your records.</div>
                <div class="footer">
                    <p>WhatsApp 1 : +33 (0) 7 43 66 05 55</p>
                    <p>WhatsApp 2 : +33 (0) 7 67 92 55 45</p>
                </div>
            </div>
        </body>
        </html>
        """

        params = {
            "from": "2good2breal <onboarding@resend.dev>",
            "to": [user_email],
            "subject": f"Acceptance of Submission - Reference #{reference_id[:8].upper()}",
            "html": html_content,
            "attachments": [
                {
                    "filename": f"Acceptance_Form_{reference_id[:8].upper()}.pdf",
                    "content": pdf_base64
                }
            ]
        }

        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Client acceptance confirmation with PDF sent to: {user_email}")
    except Exception as e:
        logger.error(f"Failed to send client acceptance confirmation to {user_email}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

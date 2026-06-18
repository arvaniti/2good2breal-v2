import logging
from io import BytesIO
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from models.analysis import ProfileAnalysisRequest

logger = logging.getLogger(__name__)


def generate_admin_submission_pdf(user_email: str, user_name: str, profile: ProfileAnalysisRequest, photos_count: int, submission_date: str) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1.5*cm, bottomMargin=1.5*cm, leftMargin=2*cm, rightMargin=2*cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, textColor=colors.HexColor('#a553be'), alignment=TA_CENTER, spaceAfter=20)
    section_style = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#a553be'), spaceBefore=15, spaceAfter=10)
    label_style = ParagraphStyle('Label', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#666666'), fontName='Helvetica-Bold')
    value_style = ParagraphStyle('Value', parent=styles['Normal'], fontSize=10, leading=14)
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#999999'), alignment=TA_CENTER)

    elements = []
    elements.append(Paragraph("2Good2bReal", title_style))
    elements.append(Paragraph("Profile Submission", ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=14, alignment=TA_CENTER, spaceAfter=5)))
    elements.append(Paragraph(f"Date: {submission_date}", ParagraphStyle('Date', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor('#666666'), spaceAfter=20)))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#a553be'), spaceAfter=20))

    elements.append(Paragraph("Client Information", section_style))
    client_data = [
        ["Client Name:", user_name or "N/A"],
        ["Client Email:", user_email or "N/A"],
        ["Report Email:", profile.client_email or "N/A"],
        ["Client Age:", profile.client_age or "N/A"],
        ["Client Location:", profile.client_location or "N/A"],
    ]
    client_table = Table(client_data, colWidths=[4*cm, 12*cm])
    client_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(client_table)

    elements.append(Paragraph("Profile Information", section_style))
    profile_data = [
        ["Profile Name:", profile.profile_name or "N/A"],
        ["Full Real Name:", profile.full_real_name or "N/A"],
        ["Gender:", profile.gender or "N/A"],
        ["Height:", profile.height or "N/A"],
        ["Date of Birth:", profile.date_of_birth or "N/A"],
        ["Assumed Age:", profile.assumed_age or "N/A"],
        ["Nationality:", profile.nationality or "N/A"],
        ["Profile Location:", profile.profile_location or "N/A"],
    ]
    profile_table = Table(profile_data, colWidths=[4*cm, 12*cm])
    profile_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(profile_table)

    elements.append(Paragraph("Professional Information", section_style))
    prof_data = [
        ["Occupation:", profile.occupation or "N/A"],
        ["Company Name:", profile.company_name or "N/A"],
        ["Company Website:", profile.company_website or "N/A"],
    ]
    prof_table = Table(prof_data, colWidths=[4*cm, 12*cm])
    prof_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(prof_table)

    elements.append(Paragraph("Dating Platform Details", section_style))
    dating_data = [
        ["Dating Platform:", profile.dating_platform or "N/A"],
        ["Photos Count:", str(profile.profile_photos_count) if profile.profile_photos_count else "N/A"],
        ["Verified Photos:", "Yes" if profile.has_verified_photos else "No"],
        ["Profile Created:", profile.profile_creation_date or "N/A"],
        ["Last Active:", profile.last_active or "N/A"],
        ["Social Media:", profile.social_media_links or "N/A"],
    ]
    dating_table = Table(dating_data, colWidths=[4*cm, 12*cm])
    dating_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(dating_table)

    elements.append(Paragraph("Bio & Communications", section_style))
    elements.append(Paragraph(f"<b>Profile Bio:</b>", label_style))
    elements.append(Paragraph(profile.profile_bio or "N/A", value_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>Language:</b> {profile.language_of_communication or 'N/A'}", value_style))
    elements.append(Paragraph(f"<b>Communication Frequency:</b> {profile.communication_frequency or 'N/A'}", value_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>Message Substance:</b>", label_style))
    elements.append(Paragraph(profile.message_substance or "N/A", value_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>Observations/Concerns:</b>", label_style))
    elements.append(Paragraph(profile.observations_concerns or "N/A", value_style))

    elements.append(Spacer(1, 15))
    elements.append(Paragraph(f"<b>Photos Uploaded:</b> {photos_count}", value_style))

    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc'), spaceAfter=10))
    elements.append(Paragraph("2Good2bReal - Professional Profile Verification Service", footer_style))
    elements.append(Paragraph("www.2good2breal.com", footer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def generate_acceptance_pdf(user_name: str, reference_id: str, package_type: str, current_date: str) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2.5*cm, rightMargin=2.5*cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#a553be'), alignment=TA_CENTER, spaceAfter=30)
    normal_style = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=11, leading=18, spaceAfter=12)
    label_style = ParagraphStyle('Label', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#666666'), fontName='Helvetica-Bold')
    signature_name_style = ParagraphStyle('SignatureName', parent=styles['Normal'], fontSize=11, fontName='Helvetica-Bold')
    signature_title_style = ParagraphStyle('SignatureTitle', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#666666'), fontName='Helvetica-Oblique')
    company_style = ParagraphStyle('Company', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#a553be'), fontName='Helvetica-Bold')
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#999999'), alignment=TA_CENTER)

    package_names = {"basic": "Standard", "comprehensive": "Comprehensive", "premium": "Premium"}
    package_display = package_names.get(package_type, "Standard")

    elements = []
    elements.append(Paragraph("Acceptance of Submission Form", title_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#a553be'), spaceAfter=20))

    info_data = [
        [Paragraph("Date", label_style), Paragraph(current_date, normal_style)],
        [Paragraph("Reference Number", label_style), Paragraph(reference_id[:8].upper(), normal_style)]
    ]
    info_table = Table(info_data, colWidths=[4*cm, 10*cm])
    info_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8)]))
    elements.append(info_table)
    elements.append(Spacer(1, 30))

    elements.append(Paragraph(f"Dear {user_name},", normal_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Your Profile submission has been well received by 2good2breal. Our team have begun the initial stages of verification and A.I. systems analysis.", normal_style))
    elements.append(Paragraph(f"Once your <b>{package_display}</b> report has been thoroughly and conclusively completed by us, we will email it to you. Typically, this will be within 48 hours.", normal_style))
    elements.append(Paragraph("For any queries you may have in the meantime, please email or send us a brief message via Whatsapp.", normal_style))
    elements.append(Spacer(1, 40))

    elements.append(Paragraph("Best regards,", normal_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Jamie Madison", signature_name_style))
    elements.append(Paragraph("Associate CEO", signature_title_style))
    elements.append(Paragraph("2good2breal", company_style))
    elements.append(Spacer(1, 50))

    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e0e0e0'), spaceAfter=15))
    elements.append(Paragraph("WhatsApp 1 : +33 (0) 7 43 66 05 55 | WhatsApp 2 : +33 (0) 7 67 92 55 45", footer_style))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

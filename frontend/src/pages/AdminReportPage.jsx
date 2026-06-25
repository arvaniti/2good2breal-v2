import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Printer, Send, Save, AlertTriangle, CheckCircle, Clock, AlertCircle, Eye, FileText, Download, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const printStyles = `
@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
  .no-print { display: none !important; }
  .page-break { page-break-before: always; }
}
.pr-page { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #111; line-height: 1.6; }
.pr-header { border-bottom: 4px solid #a553be; padding-bottom: 20px; margin-bottom: 30px; }
.pr-logo { font-size: 32px; font-weight: bold; color: #a553be; margin: 0; }
.pr-subtitle { font-size: 18px; font-weight: bold; color: #a553be; margin: 5px 0 0 0; }
.pr-section { margin-bottom: 25px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
.pr-section-title { font-size: 18px; font-weight: bold; color: #a553be; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #a553be; }
.pr-section-title-black { font-size: 18px; font-weight: bold; color: #111; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ddd; }
.pr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pr-field { font-size: 13px; margin: 6px 0; }
.pr-label { color: #666; font-weight: 500; }
.pr-value { color: #111; }
.pr-verdict { text-align: center; padding: 15px; border-radius: 8px; margin: 15px 0; }
.pr-verdict-text { font-size: 18px; font-weight: bold; color: white; margin: 0; }
.pr-box { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 10px 0; white-space: pre-wrap; font-size: 13px; }
.pr-expert-box { background: #f8fafc; padding: 25px; border-radius: 8px; min-height: 200px; margin: 15px 0; border: 1px solid #e2e8f0; }
.pr-footer { margin-top: 40px; padding: 25px; background: #faf5ff; border-radius: 8px; text-align: center; border: 2px solid #a553be; }
.pr-contact { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #888; }
.pr-list { margin: 15px 0; padding-left: 0; }
.pr-list-item { margin: 15px 0; padding: 10px 15px; background: #f8fafc; border-left: 3px solid #a553be; font-size: 13px; }
`;

function PrintField(props) {
  return React.createElement('p', {className: 'pr-field'},
    React.createElement('span', {className: 'pr-label'}, props.label + ': '),
    React.createElement('span', {className: 'pr-value'}, props.value || 'N/A')
  );
}

function getScoreInfo(score) {
  if (score <= 25) return { text: 'Extreme High Risk', color: '#dc2626', bgColor: '#fef2f2' };
  if (score <= 51) return { text: 'Medium to High Risk', color: '#1e3a8a', bgColor: '#eff6ff' };
  if (score <= 70) return { text: 'Average to Low Risk', color: '#0ea5e9', bgColor: '#f0f9ff' };
  if (score <= 85) return { text: 'Reliable, Satisfactory Profile', color: '#6b7280', bgColor: '#f9fafb' };
  return { text: 'Approved, certified Profile', color: '#ca8a04', bgColor: '#fefce8' };
}

export function AdminReportPage() {
  const navigate = useNavigate();
  const params = useParams();
  const analysisId = params.analysisId;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDocxPreview, setShowDocxPreview] = useState(false);
  const [adminReport, setAdminReport] = useState({
    verdict: '',
    detailedAnalysis: '',
    recommendations: '',
    additionalNotes: ''
  });

  useEffect(function() {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/login'); return; }
    axios.get(API + '/admin/analyses/' + analysisId, { headers: { Authorization: 'Bearer ' + token } })
      .then(function(res) {
        setAnalysis(res.data);
        if (res.data.admin_report) setAdminReport(res.data.admin_report);
        setLoading(false);
      })
      .catch(function() { toast.error('Failed to load'); setLoading(false); });
  }, [analysisId, navigate]);

  function updateReport(field, value) {
    setAdminReport(function(prev) {
      const updated = {};
      for (const key in prev) updated[key] = prev[key];
      updated[field] = value;
      return updated;
    });
  }

  function handleSave() {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setSaving(true);
    axios.post(API + '/admin/analyses/' + analysisId + '/report', { admin_report: adminReport, status: 'completed' }, { headers: { Authorization: 'Bearer ' + token } })
      .then(function() { toast.success('Report saved'); setSaving(false); })
      .catch(function() { toast.error('Failed to save'); setSaving(false); });
  }

  function handleSend() {
    const token = localStorage.getItem('admin_token');
    if (!token || !adminReport.verdict || !analysis) return;
    setSaving(true);
    axios.post(API + '/admin/analyses/' + analysisId + '/send-report', { admin_report: adminReport, client_email: analysis.user_email }, { headers: { Authorization: 'Bearer ' + token } })
      .then(function() { toast.success('Report sent'); setSaving(false); })
      .catch(function() { toast.error('Failed to send'); setSaving(false); });
  }

  function handleDownloadDocx() {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    const downloadUrl = API + '/admin/analyses/' + analysisId + '/download-docx?token=' + encodeURIComponent(token);
    window.open(downloadUrl, '_self');
  }

  if (loading) return React.createElement('div', {className: 'min-h-screen bg-zinc-950 flex items-center justify-center'}, React.createElement('div', {className: 'text-purple-400'}, 'Loading...'));
  if (!analysis) return React.createElement('div', {className: 'min-h-screen bg-zinc-950 flex items-center justify-center'}, React.createElement('div', {className: 'text-red-400'}, 'Not found'));

  const formData = analysis.form_data || {};
  const ai = analysis.ai_analysis;
  const scoreInfo = ai ? getScoreInfo(ai.overall_score || 0) : null;
  
  const verdictInfo = {
    safe: { bg: '#10b981', text: 'SAFE - Profile appears authentic' },
    suspicious: { bg: '#f59e0b', text: 'SUSPICIOUS - Exercise caution' },
    dangerous: { bg: '#ef4444', text: 'DANGEROUS - High risk of scam' },
    inconclusive: { bg: '#6b7280', text: 'INCONCLUSIVE - More information needed' }
  };
  const vInfo = verdictInfo[adminReport.verdict] || verdictInfo.inconclusive;

  // Helper function for DOCX preview risk level
  function getRiskLevel(score) {
    if (score <= 25) return 'EXTREME HIGH RISK';
    if (score <= 51) return 'HIGH';
    if (score <= 70) return 'MEDIUM';
    if (score <= 85) return 'LOW';
    return 'VERY LOW';
  }

  // DOCX Preview Component - matches exact template format
  if (showDocxPreview) {
    const docxStyles = {
      page: { fontFamily: 'Calibri, Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px', background: 'white', color: '#111', lineHeight: '1.6' },
      header: { marginBottom: '30px' },
      logo: { fontSize: '28px', fontWeight: 'bold', color: '#a553be', margin: '0' },
      subtitle: { fontSize: '16px', fontWeight: 'bold', margin: '5px 0 0 0' },
      date: { fontSize: '13px', color: '#666', margin: '10px 0' },
      sectionHeader: { fontSize: '16px', fontWeight: 'bold', margin: '25px 0 15px 0', textTransform: 'uppercase' },
      fieldLine: { fontSize: '13px', margin: '8px 0' },
      fieldLabel: { fontWeight: 'bold', marginRight: '8px' },
      redFlagsHeader: { fontSize: '14px', fontWeight: 'bold', color: '#dc2626', margin: '15px 0' },
      flagType: { fontWeight: 'bold', margin: '15px 0 5px 0' },
      flagDetail: { fontSize: '13px', margin: '3px 0 3px 15px' },
      bulletList: { margin: '10px 0', paddingLeft: '25px' },
      bulletItem: { margin: '6px 0', fontSize: '13px' },
      numberedItem: { margin: '12px 0', fontSize: '13px' },
      footer: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd' },
      confidential: { textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginTop: '20px' }
    };

    const aiData = ai || {};
    const redFlags = aiData.red_flags || [];
    const aiRecommendations = aiData.recommendations || [];
    const trustScore = aiData.overall_score || 0;
    const summary = aiData.analysis_summary || aiData.summary || '';
    const sharedLanguage = formData.language_of_communication || formData.shared_language || '';

    return (
      <div className="min-h-screen bg-zinc-900">
        {/* Toolbar */}
        <div className="bg-zinc-800 p-4 flex justify-between items-center sticky top-0 z-50 border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={function() { setShowDocxPreview(false); }} className="border-zinc-600 text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <span className="text-white font-medium">Aperçu DOCX - Format Final</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleDownloadDocx} className="bg-blue-600 hover:bg-blue-500">
              <Download className="w-4 h-4 mr-2" /> Télécharger DOCX
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="py-8 px-4">
          <div style={docxStyles.page} className="shadow-xl rounded-lg border border-zinc-300">
            
            {/* HEADER */}
            <div style={{marginBottom: '20px', textAlign: 'center'}}>
              <img src="/logo.png" alt="2good2breal" style={{height: '40px', marginBottom: '10px'}} onError={(e) => { e.target.style.display = 'none'; }} />
              <p style={{fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', margin: 0}}>2good2breal</p>
              <p style={{fontSize: '16px', fontWeight: 'bold', margin: '5px 0'}}>Profile Verification Report</p>
              <p style={{fontSize: '13px', textAlign: 'right'}}><span style={{fontWeight: 'bold'}}>Date:</span> {new Date().toISOString().split('T')[0]}</p>
            </div>

            {/* TABLE 1: CLIENT INFORMATION */}
            <p style={docxStyles.sectionHeader}>CLIENT INFORMATION</p>
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px'}}>
              <tbody>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', width: '15%', backgroundColor: '#f9f9f9'}}>NAME</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', width: '35%'}}>{analysis.user_name || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', width: '15%', backgroundColor: '#f9f9f9'}}>EMAIL</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', width: '35%'}}>{analysis.user_email || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>AGE</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.client_age || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>LOCATION</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.client_location || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* TABLE 2: PROFILE INFORMATION */}
            <p style={docxStyles.sectionHeader}>PROFILE INFORMATION</p>
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px'}}>
              <tbody>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>PROFILE NAME</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.profile_name || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>FULL REAL NAME</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.full_real_name || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>GENDER</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>HEIGHT</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.height || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>NATIONALITY</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.nationality || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>SHARED LANGUAGE</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{sharedLanguage || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>MARITAL STATUS</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.assumed_marital_status || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>HOBBIES / INTERESTS</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.hobbies_interests || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>UNIVERSITY / COLLEGE</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.university_college || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>YEAR/S OF ATTENDANCE</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.years_of_attendance || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* TABLE 3: PROFILE DETAILS */}
            <p style={docxStyles.sectionHeader}>PROFILE DETAILS</p>
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px'}}>
              <tbody>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>DATE OF BIRTH</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.date_of_birth || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>KNOWN AGE</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.assumed_age || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>LOCATION</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.profile_location || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>PLATFORM</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.dating_platform || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>OCCUPATION</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.occupation || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>COMPANY NAME</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.company_name || '-'}</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ccc', padding: '6px', fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>COMPANY WEBSITE</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}>{formData.company_website || '-'}</td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}></td>
                  <td style={{border: '1px solid #ccc', padding: '6px'}}></td>
                </tr>
              </tbody>
            </table>

            {/* ANALYSIS RESULTS */}
            <p style={docxStyles.sectionHeader}>ANALYSIS RESULTS</p>
            <p style={docxStyles.fieldLine}>
              <span style={docxStyles.fieldLabel}>Trust Score:</span> {trustScore}/100 - {getRiskLevel(trustScore)}
            </p>
            
            {/* Rating Scale Image */}
            <div style={{textAlign: 'center', margin: '20px 0'}}>
              <img 
                src="/rating_scale.jpg" 
                alt="Integrity & Risk Assessment Scale (0-100)" 
                style={{maxWidth: '100%', width: '500px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
            
            {summary && (
              <p style={{...docxStyles.fieldLine, marginTop: '15px'}}>
                <span style={docxStyles.fieldLabel}>SUMMARY:</span> {summary}
              </p>
            )}

            <p style={docxStyles.redFlagsHeader}>RED FLAGS DETECTED ({redFlags.length}):</p>
            {redFlags.map(function(flag, index) {
              const flagCategory = flag.category || flag.type || 'Unknown';
              const flagSeverity = (flag.severity || 'MEDIUM').toUpperCase();
              return (
                <div key={index} style={{marginBottom: '15px'}}>
                  <p style={docxStyles.flagType}>{flagCategory}:</p>
                  {flag.description && <p style={docxStyles.flagDetail}><span style={{fontWeight: 'bold'}}>Description:</span> {flag.description}</p>}
                  {flag.recommendation && <p style={docxStyles.flagDetail}><span style={{fontWeight: 'bold'}}>Recommendation:</span> {flag.recommendation}</p>}
                  <p style={docxStyles.flagDetail}><span style={{fontWeight: 'bold'}}>Severity:</span> {flagSeverity}</p>
                </div>
              );
            })}

            {/* SOME RECOMMENDATIONS */}
            <p style={docxStyles.sectionHeader}>SOME RECOMMENDATIONS:</p>
            {aiRecommendations.length > 0 ? (
              <ul style={docxStyles.bulletList}>
                {aiRecommendations.map(function(rec, index) {
                  return <li key={index} style={docxStyles.bulletItem}>{rec}</li>;
                })}
              </ul>
            ) : (
              <ul style={docxStyles.bulletList}>
                <li style={docxStyles.bulletItem}>Continue communicating through the platform or verified channels.</li>
                <li style={docxStyles.bulletItem}>Schedule a video call to fully bridge the gap between digital profile and reality.</li>
                <li style={docxStyles.bulletItem}>The lack of news for one day is common for a business owner; do not interpret this as a 'disappearing' tactic yet.</li>
                <li style={docxStyles.bulletItem}>Verify the 'travel' claims if he asks for any financial assistance involving travel (though no current signs of this exist).</li>
              </ul>
            )}

            {/* PAGE BREAK INDICATOR - Page 2: CONCLUSIVE ANALYSIS - POINTS */}
            <div style={{borderTop: '2px dashed #ccc', margin: '30px 0', textAlign: 'center', color: '#999', fontSize: '11px', padding: '5px 0'}}>
              — Page 2 —
            </div>

            {/* CONCLUSIVE ANALYSIS - POINTS - Title Page */}
            <div style={{textAlign: 'center', padding: '80px 0', minHeight: '200px'}}>
              <p style={{fontSize: '24px', fontWeight: 'bold'}}>CONCLUSIVE ANALYSIS - POINTS</p>
            </div>

            {/* PAGE BREAK INDICATOR - Page 3: CONCLUSIVE ANALYSIS OVERALL */}
            <div style={{borderTop: '2px dashed #ccc', margin: '30px 0', textAlign: 'center', color: '#999', fontSize: '11px', padding: '5px 0'}}>
              — Page 3 —
            </div>
            
            {/* CONCLUSIVE ANALYSIS OVERALL - Title Page */}
            <div style={{textAlign: 'center', padding: '80px 0', minHeight: '200px'}}>
              <p style={{fontSize: '24px', fontWeight: 'bold'}}>CONCLUSIVE ANALYSIS OVERALL</p>
            </div>

            {/* PAGE BREAK INDICATOR - Page 4: RECOMMANDATIONS OVERALL */}
            <div style={{borderTop: '2px dashed #ccc', margin: '30px 0', textAlign: 'center', color: '#999', fontSize: '11px', padding: '5px 0'}}>
              — Page 4 —
            </div>
            
            {/* RECOMMANDATIONS OVERALL - Title Page */}
            <div style={{textAlign: 'center', padding: '80px 0', minHeight: '200px'}}>
              <p style={{fontSize: '24px', fontWeight: 'bold'}}>RECOMMANDATIONS OVERALL</p>
            </div>

            {/* PAGE BREAK INDICATOR - Page 5: Content */}
            <div style={{borderTop: '2px dashed #ccc', margin: '30px 0', textAlign: 'center', color: '#999', fontSize: '11px', padding: '5px 0'}}>
              — Page 5 —
            </div>
            
            <p style={{fontWeight: 'bold', fontSize: '13px', margin: '15px 0'}}>OVERALL Research and Verifications performed include some of the following:</p>
            
            <p style={docxStyles.numberedItem}><span style={{fontWeight: 'bold'}}>1. Platform Analysis</span> Intense scrutinizing of all platforms used by 'the profile' in the past and present.</p>
            <p style={docxStyles.numberedItem}><span style={{fontWeight: 'bold'}}>2. Occupation Verification</span> Resourcing and authenticating profile's occupation via one on one discrete and direct communication means. Access to occupation and / or company official website through various complex and often unattainable platforms. Intense cross-checking of the profile's email addresses and user names worldwide.</p>
            <p style={docxStyles.numberedItem}><span style={{fontWeight: 'bold'}}>3. Photo Identification</span> Photo identification via cross-checking of multiple image databases and reverse image search platforms. Detection and screening for multiple and stolen identities. Research and confirmation of all Profile Platforms, Locations and Residencies previously and in use today.</p>
            <p style={docxStyles.numberedItem}><span style={{fontWeight: 'bold'}}>4. Location Verification</span> Verification of locations such as photo venues, background images and sceneries relating to where the profile claims to be or reside.</p>
            <p style={docxStyles.numberedItem}><span style={{fontWeight: 'bold'}}>5. Location Cross Referencing</span> Cross referencing of all the profile's locations and personal details to detect any mismatched information.</p>
            <p style={docxStyles.numberedItem}><span style={{fontWeight: 'bold'}}>6. Photo Authenticity</span> Clarity and authenticity of all photos provided by you and of those 2good2breal gains access to via websites, apps, platforms and other means.</p>
            <p style={docxStyles.numberedItem}><span style={{fontWeight: 'bold'}}>7. Additional Recommendations</span> Based on our analysis, we recommend:</p>
            
            <ul style={{...docxStyles.bulletList, marginLeft: '20px'}}>
              <li style={docxStyles.bulletItem}>Block and report the account on the platform,</li>
              <li style={docxStyles.bulletItem}>Save evidence such as screenshots and user names in the event you need to report it in future,</li>
              <li style={docxStyles.bulletItem}>Talk to someone you trust about the situation for support if you feel the need.</li>
              <li style={docxStyles.bulletItem}>Consider stepping back or ending the conversation and /or contact. As the situation is extremely ambiguous, in our opinion, it is essential to walk away and disconnect.</li>
              <li style={docxStyles.bulletItem}>If your situation with this profile has escalated to a point that you feel overwhelmed, do not hesitate to seek professional help.</li>
              <li style={docxStyles.bulletItem}>Keep your offline life grounded and intact. If you wish further analyzing of this profile, please provide us with more personal details such as extended family information, presumed previous occupations and subsequent history on your next request.</li>
            </ul>

            {/* PAGE BREAK INDICATOR - Footer */}
            <div style={{borderTop: '2px dashed #ccc', margin: '30px 0', textAlign: 'center', color: '#999', fontSize: '11px', padding: '5px 0'}}>
              — Page 6 —
            </div>

            {/* FOOTER */}
            <div style={docxStyles.footer}>
              <p style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '15px'}}>Thank you for choosing 2good2breal</p>
              <p style={{fontSize: '13px', marginBottom: '15px', lineHeight: '1.7'}}>
                We hope this report assists to clarify, confirm or dismiss any doubts you may have of your Profile's authenticity or intentions. Furthermore, our team aims to provide you with an objective, informative and reliable report to help guide you towards well founded and smart decision making with this person in future. All the best from our team at 2good2breal.
              </p>
              
              <p style={{fontSize: '13px', margin: '10px 0'}}><span style={{fontWeight: 'bold'}}>Contact:</span> contact@2good2breal.com</p>
              <p style={{fontSize: '13px', margin: '10px 0'}}><span style={{fontWeight: 'bold'}}>Report Reference:</span> {analysis.id}</p>
              
              <p style={{fontStyle: 'italic', fontSize: '12px', margin: '20px 0', color: '#666'}}>
                This analysis should not be considered as legal advice.
              </p>
              
              <p style={{fontSize: '12px', textAlign: 'center', color: '#666', marginTop: '20px'}}>
                2good2breal - Profile Verification Service<br/>
                contact@2good2breal.com | +33 (0) 7 67 92 55 45 | www.2good2breal.com
              </p>
              
              <p style={docxStyles.confidential}>This document is confidential.</p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white">
        <style>{printStyles}</style>
        <div className="no-print bg-zinc-900 p-4 flex justify-between sticky top-0 z-50">
          <Button variant="outline" size="sm" onClick={function() { setShowPreview(false); }} className="border-zinc-700 text-zinc-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edit
          </Button>
          <Button onClick={function() { window.print(); }} className="bg-purple-600">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
        
        <div id="print-area" className="pr-page">
          
          {/* ============ PAGE 1 ============ */}
          
          {/* Header */}
          <div className="pr-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <img src="/logo.png" alt="2good2breal" style={{height: '147px', width: 'auto', marginBottom: '5px'}} />
              <p className="pr-subtitle">PREMIUM VERIFICATION REPORT</p>
            </div>
            <div style={{textAlign: 'right', fontSize: '12px', color: '#666'}}>
              <p style={{margin: '2px 0'}}>Date: {new Date().toLocaleDateString('fr-FR')}</p>
              <p style={{margin: '2px 0'}}>Reference: #{(analysis.id || '').slice(0,8).toUpperCase()}</p>
            </div>
          </div>

          {/* Part A: Client Information */}
          <div className="pr-section">
            <h2 className="pr-section-title">Client Information</h2>
            <div className="pr-grid">
              <PrintField label="Name" value={analysis.user_name} />
              <PrintField label="Email" value={analysis.user_email} />
              <PrintField label="Age" value={formData.client_age} />
              <PrintField label="Location" value={formData.client_location} />
            </div>
          </div>

          {/* Profile Verified */}
          <div className="pr-section">
            <h2 className="pr-section-title">Profile Verified</h2>
            <div className="pr-grid">
              <PrintField label="Profile Name" value={formData.profile_name} />
              <PrintField label="Full Name" value={formData.full_real_name} />
              <PrintField label="Gender" value={formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : ''} />
              <PrintField label="Age" value={formData.assumed_age} />
              <PrintField label="Nationality" value={formData.nationality} />
              <PrintField label="Location" value={formData.profile_location} />
              <PrintField label="Occupation" value={formData.occupation} />
              <PrintField label="Company" value={formData.company_name} />
              <PrintField label="Platform" value={formData.dating_platform} />
              <PrintField label="Photos" value={formData.profile_photos_count} />
            </div>
            {formData.observations_concerns ? (
              <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee'}}>
                <p style={{fontWeight: 'bold', color: '#d97706', marginBottom: '8px'}}>Client Observations and Concerns:</p>
                <div className="pr-box" style={{background: '#fffbeb', border: '1px solid #fcd34d', minHeight: '80px', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{formData.observations_concerns}</div>
              </div>
            ) : null}

            {/* Risk-Assessment Checklist */}
            <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee'}}>
              <p style={{fontWeight: 'bold', color: '#dc2626', marginBottom: '8px', fontSize: '16px'}}>Risk-Assessment Checklist</p>
              <p style={{color: '#555', marginBottom: '12px', fontStyle: 'italic'}}>Please respond Yes or No to the following questions:</p>
              <div style={{background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '15px'}}>
                <ol style={{margin: 0, paddingLeft: '20px', color: '#333', lineHeight: '2'}}>
                  <li>Has the profile done a normal, clear video call?</li>
                  <li>Has the profile sent a timestamped photo on request?</li>
                  <li>Do the profile's details seem consistent over time?</li>
                  <li>Does the profile avoid answering direct questions?</li>
                  <li>Does the profile seem to push for rapid emotional intimacy?</li>
                </ol>
              </div>
            </div>
            {formData.message_substance ? (
              <div style={{marginTop: '15px'}}>
                <p style={{fontWeight: 'bold', color: '#6366f1', marginBottom: '8px'}}>Message Substance:</p>
                <div className="pr-box" style={{background: '#eef2ff', border: '1px solid #a5b4fc', minHeight: '80px', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{formData.message_substance}</div>
              </div>
            ) : null}
          </div>

          {/* ============ PAGE 2: TRUST SCORE + EXPERT ANALYSIS ============ */}
          <div className="page-break"></div>

          {/* Part B: Trust Score */}
          <div className="pr-section" style={{background: '#fafafa', padding: '15px 20px', marginTop: '15px'}}>
            <h2 style={{fontSize: '22px', fontWeight: 'bold', color: '#a553be', textAlign: 'center', margin: '0 0 10px 0'}}>Trust Score</h2>
            <p style={{fontSize: '13px', color: '#555', textAlign: 'center', margin: '0 0 15px 0'}}>Our trust score assigns a value to how risky the profile may be relative to your concerns.</p>
            
            {ai && ai.overall_score !== undefined ? (
              <div>
                {/* Score Display */}
                <div style={{textAlign: 'center', padding: '15px', background: 'white', borderRadius: '10px', marginBottom: '12px', border: '2px solid #e5e7eb'}}>
                  <p style={{margin: '0 0 2px 0', fontSize: '15px', fontWeight: 'bold', color: '#a553be'}}>Assessment</p>
                  <p style={{margin: 0}}>
                    <span style={{fontSize: '44px', fontWeight: 'bold', color: '#dc2626'}}>{ai.overall_score}</span>
                    <span style={{fontSize: '44px', fontWeight: 'bold', color: '#666'}}>/100</span>
                  </p>
                  <p style={{margin: '8px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: scoreInfo.color, background: scoreInfo.bgColor, padding: '6px 14px', borderRadius: '6px', display: 'inline-block'}}>
                    {ai.overall_score <= 25 ? 'Potentially money seeking and Financial scamming intentions' : scoreInfo.text}
                  </p>
                </div>

                {/* Score Legend - Compact */}
                <div style={{background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                  <p style={{margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#a553be', textAlign: 'center'}}>Dishonesty and Integrity Profile Rating</p>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px'}}>
                    <div style={{display: 'flex', alignItems: 'center', padding: '4px 8px', background: '#fef2f2', borderRadius: '4px', borderLeft: '3px solid #dc2626'}}>
                      <span style={{width: '55px', fontWeight: 'bold', color: '#dc2626', fontSize: '13px'}}>0 - 25</span>
                      <span style={{color: '#dc2626', fontWeight: '500', fontSize: '13px'}}>Extreme High Risk</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', padding: '4px 8px', background: '#eff6ff', borderRadius: '4px', borderLeft: '3px solid #1e3a8a'}}>
                      <span style={{width: '55px', fontWeight: 'bold', color: '#1e3a8a', fontSize: '13px'}}>26 - 51</span>
                      <span style={{color: '#1e3a8a', fontWeight: '500', fontSize: '13px'}}>Medium to High Risk</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', padding: '4px 8px', background: '#f0f9ff', borderRadius: '4px', borderLeft: '3px solid #0ea5e9'}}>
                      <span style={{width: '55px', fontWeight: 'bold', color: '#0ea5e9', fontSize: '13px'}}>52 - 70</span>
                      <span style={{color: '#0ea5e9', fontWeight: '500', fontSize: '13px'}}>Average to Low Risk</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', padding: '4px 8px', background: '#f9fafb', borderRadius: '4px', borderLeft: '3px solid #6b7280'}}>
                      <span style={{width: '55px', fontWeight: 'bold', color: '#6b7280', fontSize: '13px'}}>71 - 85</span>
                      <span style={{color: '#6b7280', fontWeight: '500', fontSize: '13px'}}>Reliable, Satisfactory</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', padding: '4px 8px', background: '#fefce8', borderRadius: '4px', borderLeft: '3px solid #ca8a04', gridColumn: 'span 2', justifyContent: 'center'}}>
                      <span style={{width: '55px', fontWeight: 'bold', color: '#ca8a04', fontSize: '13px'}}>86 - 100</span>
                      <span style={{color: '#ca8a04', fontWeight: '500', fontSize: '13px'}}>Approved, certified Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{textAlign: 'center', color: '#999', padding: '20px'}}>Trust Score analysis not available for this profile.</p>
            )}
          </div>

          {/* Part C: Expert Analysis - Same Page as Trust Score */}
          <div className="pr-section" style={{background: '#faf5ff', borderColor: '#a553be', marginTop: '15px', padding: '15px 20px'}}>
            <h2 className="pr-section-title" style={{marginBottom: '10px'}}>Expert Analysis</h2>
            <p style={{fontStyle: 'italic', color: '#555', marginBottom: '12px', fontSize: '13px'}}>
              Our extensive, comprehensive analysis researches and verification concludes:
            </p>
            
            {adminReport.verdict ? (
              <div className="pr-verdict" style={{background: vInfo.bg, marginBottom: '15px'}}>
                <p className="pr-verdict-text">{vInfo.text}</p>
              </div>
            ) : null}

            <div className="pr-expert-box" style={{minHeight: '120px', padding: '15px'}}>
              <p style={{margin: 0, fontSize: '13px', lineHeight: '1.7'}}>
                {adminReport.detailedAnalysis ? adminReport.detailedAnalysis : (ai && ai.analysis_summary ? ai.analysis_summary : 'Expert analysis pending. Please enter your detailed analysis based on the AI findings and verification results.')}
              </p>
            </div>
          </div>

          {/* ============ PAGE 3: BLANK ============ */}
          <div className="page-break"></div>
          <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <p style={{color: '#ccc', fontStyle: 'italic', fontSize: '12px'}}>This page intentionally left blank</p>
          </div>

          {/* ============ PAGE 4: RESEARCH AND VERIFICATIONS ============ */}
          <div className="page-break"></div>

          {/* Part D: Researches and Verification */}
          <div className="pr-section">
            <h2 className="pr-section-title">Research and Verifications performed include some of the following:</h2>
            
            <div className="pr-list">
              <div className="pr-list-item">
                <p style={{margin: 0, fontWeight: 'bold', color: '#a553be'}}>1. Platform Analysis</p>
                <p style={{margin: '8px 0 0 0'}}>Intense scrutinizing of all platforms used by 'the profile' in the past and present.</p>
              </div>
              
              <div className="pr-list-item">
                <p style={{margin: 0, fontWeight: 'bold', color: '#a553be'}}>2. Occupation Verification</p>
                <p style={{margin: '8px 0 0 0'}}>Resourcing and authenticating profile's occupation via one on one discrete and direct communication means. Access to occupation and / or company official website through various complex and often unattainable platforms.<br/>Intense cross-checking of the profile's email addresses and user names worldwide.</p>
              </div>
              
              <div className="pr-list-item">
                <p style={{margin: 0, fontWeight: 'bold', color: '#a553be'}}>3. Photo Identification</p>
                <p style={{margin: '8px 0 0 0'}}>Photo identification via cross-checking of multiple image databases and reverse image search platforms. Detection and screening for multiple and stolen identities.<br/>Research and confirmation of all Profile Platforms, Locations and Residencies previously and in use today.</p>
              </div>
              
              <div className="pr-list-item">
                <p style={{margin: 0, fontWeight: 'bold', color: '#a553be'}}>4. Location Verification</p>
                <p style={{margin: '8px 0 0 0'}}>Verification of locations such as photo venues, background images and sceneries relating to where the profile claims to be or reside.</p>
              </div>
              
              <div className="pr-list-item">
                <p style={{margin: 0, fontWeight: 'bold', color: '#a553be'}}>5. Location Cross Referencing</p>
                <p style={{margin: '8px 0 0 0'}}>Cross referencing of all the profile's locations and personal details to detect any mismatched information.</p>
              </div>
              
              <div className="pr-list-item">
                <p style={{margin: 0, fontWeight: 'bold', color: '#a553be'}}>6. Photo Authenticity</p>
                <p style={{margin: '8px 0 0 0'}}>Clarity and authenticity of all photos provided by you and of those 2good2breal gains access to via websites, apps, platforms and other means.</p>
              </div>
            </div>
          </div>

          {/* ============ PAGE 5: RECOMMENDATIONS + THANK YOU ============ */}
          <div className="page-break"></div>

          {/* Part E: Our Recommendations */}
          <div className="pr-section" style={{background: '#f8fafc'}}>
            <h2 className="pr-section-title">Our Recommendations</h2>
            
            <div className="pr-expert-box" style={{minHeight: '100px', padding: '15px'}}>
              <p style={{margin: 0, fontSize: '13px', lineHeight: '1.7'}}>
                {adminReport.recommendations ? adminReport.recommendations : 'Based on our analysis, we recommend:'}
              </p>
              <ul style={{margin: '10px 0 0 20px', fontSize: '13px', lineHeight: '1.9', listStyleType: 'disc'}}>
                <li>Block and report the account on the platform,</li>
                <li>Save evidence such as screenshots and user names in the event you need to report it in future,</li>
                <li>Talk to someone you trust about the situation for support if you feel the need.</li>
                <li>Consider stepping back or ending the conversation and /or contact.<br/>As the situation is extremely ambiguous, in our opinion, it is essential to walk away and disconnect.</li>
                <li>If your situation with this profile has escalated to a point that you feel overwhelmed, do not hesitate to seek professional help.</li>
                <li>Keep your offline life grounded and intact.</li>
              </ul>
            </div>
            
            {adminReport.additionalNotes ? (
              <div style={{marginTop: '15px'}}>
                <p style={{fontWeight: 'bold', color: '#666', marginBottom: '8px', fontSize: '13px'}}>Additional Notes:</p>
                <div className="pr-box" style={{fontSize: '12px'}}>{adminReport.additionalNotes}</div>
              </div>
            ) : null}
            
            {/* Further Analysis Box */}
            <div style={{marginTop: '15px', padding: '15px', background: '#f3e8ff', borderRadius: '8px', border: '1px solid #a553be'}}>
              <p style={{margin: 0, fontSize: '13px', lineHeight: '1.7', color: '#6b21a8', fontStyle: 'italic'}}>
                If you wish further analyzing of this profile, please provide us with more personal details such as extended family information, presumed previous occupations and subsequent history on your next request.
              </p>
            </div>
          </div>

          {/* Thank You Footer - Same Page as Recommendations */}
          <div className="pr-footer" style={{marginTop: '20px'}}>
            <p style={{fontSize: '18px', fontWeight: 'bold', color: '#a553be', margin: '0 0 12px 0', fontFamily: 'Arial, sans-serif'}}>Thank you for choosing <span style={{fontSize: '1.2em'}}>2</span>good<span style={{fontSize: '1.2em'}}>2</span>breal</p>
            <p style={{fontSize: '13px', color: '#555', lineHeight: '1.7', margin: '0 0 12px 0'}}>
              We hope this report assists to clarify, confirm or dismiss any doubts you may have of your Profile's authenticity or intentions.
            </p>
            <p style={{fontSize: '13px', color: '#555', lineHeight: '1.7', margin: '0 0 12px 0'}}>
              Furthermore, our team aims to provide you with an objective, informative and reliable report to help guide you towards well founded and smart decision making with this person in future.
            </p>
            <p style={{fontSize: '14px', fontWeight: 'bold', color: '#a553be', margin: '0 0 15px 0'}}>
              All the best from our team at 2good2breal.
            </p>
            <div className="pr-contact">
              <p style={{margin: '5px 0'}}>Contact: contact@2good2breal.com</p>
              <p style={{margin: '5px 0'}}>Report Reference: {analysis.id}</p>
              <p style={{margin: '10px 0 0 0', fontStyle: 'italic'}}>This analysis should not be considered as legal advice.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={function() { navigate('/admin'); }} className="border-zinc-700 text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-xl font-bold text-white">Profile Verification Report</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={function() { setShowDocxPreview(true); }} className="border-green-700 text-green-400 hover:bg-green-900/30">
              <Eye className="w-4 h-4 mr-2" /> Aperçu DOCX
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadDocx} className="border-blue-700 text-blue-400 hover:bg-blue-900/30">
              <Download className="w-4 h-4 mr-2" /> DOCX
            </Button>
            <Button variant="outline" size="sm" onClick={function() { setShowPreview(true); }} className="border-purple-700 text-purple-400 hover:bg-purple-900/30">
              <Eye className="w-4 h-4 mr-2" /> Preview & Print PDF
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader><CardTitle className="text-white">Client Info</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-zinc-400">Name: <span className="text-white">{analysis.user_name}</span></p>
                <p className="text-zinc-400">Email: <span className="text-white">{analysis.user_email}</span></p>
                <p className="text-zinc-400">Age: <span className="text-white">{formData.client_age || 'N/A'}</span></p>
                <p className="text-zinc-400">Location: <span className="text-white">{formData.client_location || 'N/A'}</span></p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader><CardTitle className="text-white">Profile Verified</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-zinc-400">Name: <span className="text-white">{formData.profile_name}</span></p>
                <p className="text-zinc-400">Gender: <span className="text-white">{formData.gender || 'N/A'}</span></p>
                <p className="text-zinc-400">Age: <span className="text-white">{formData.assumed_age || 'N/A'}</span></p>
                <p className="text-zinc-400">Location: <span className="text-white">{formData.profile_location || 'N/A'}</span></p>
                <p className="text-zinc-400">Occupation: <span className="text-white">{formData.occupation || 'N/A'}</span></p>
                <p className="text-zinc-400">Platform: <span className="text-white">{formData.dating_platform || 'N/A'}</span></p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader><CardTitle className="text-white">Trust Score</CardTitle></CardHeader>
              <CardContent>
                {ai && ai.overall_score !== undefined ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-zinc-800/50 text-center">
                      <p className="text-3xl font-bold text-red-400">{ai.overall_score}<span className="text-zinc-500 text-lg">/100</span></p>
                      <p className="text-sm text-purple-400 mt-2">{scoreInfo ? scoreInfo.text : ''}</p>
                    </div>
                  </div>
                ) : <p className="text-zinc-500 text-center py-4">No score available</p>}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900/50 border-purple-800/50">
            <CardHeader><CardTitle className="text-purple-400">Expert Report Form</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300 mb-2 block">Verdict</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" onClick={function() { updateReport('verdict', 'safe'); }} className={adminReport.verdict === 'safe' ? 'bg-emerald-600' : 'bg-zinc-800 border border-emerald-800 text-emerald-400'}>
                    <CheckCircle className="w-4 h-4 mr-1" /> SAFE
                  </Button>
                  <Button type="button" onClick={function() { updateReport('verdict', 'suspicious'); }} className={adminReport.verdict === 'suspicious' ? 'bg-amber-600' : 'bg-zinc-800 border border-amber-800 text-amber-400'}>
                    <AlertTriangle className="w-4 h-4 mr-1" /> SUSPICIOUS
                  </Button>
                  <Button type="button" onClick={function() { updateReport('verdict', 'dangerous'); }} className={adminReport.verdict === 'dangerous' ? 'bg-red-600' : 'bg-zinc-800 border border-red-800 text-red-400'}>
                    <AlertCircle className="w-4 h-4 mr-1" /> DANGEROUS
                  </Button>
                  <Button type="button" onClick={function() { updateReport('verdict', 'inconclusive'); }} className={adminReport.verdict === 'inconclusive' ? 'bg-zinc-600' : 'bg-zinc-800 border border-zinc-600 text-zinc-400'}>
                    <Clock className="w-4 h-4 mr-1" /> INCONCLUSIVE
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-zinc-300 mb-2 block">Expert Analysis</Label>
                <Textarea value={adminReport.detailedAnalysis || (ai && ai.analysis_summary ? ai.analysis_summary : '')} onChange={function(e) { updateReport('detailedAnalysis', e.target.value); }} className="bg-zinc-800/50 border-zinc-700 text-white min-h-[150px]" placeholder="Enter your expert analysis here based on the AI findings and your professional assessment..." />
              </div>
              
              <div>
                <Label className="text-zinc-300 mb-2 block">Our Recommendations</Label>
                <Textarea value={adminReport.recommendations} onChange={function(e) { updateReport('recommendations', e.target.value); }} className="bg-zinc-800/50 border-zinc-700 text-white min-h-[120px]" placeholder="Based on our analysis, we recommend..." />
              </div>
              
              <div>
                <Label className="text-zinc-300 mb-2 block">Additional Notes</Label>
                <Textarea value={adminReport.additionalNotes} onChange={function(e) { updateReport('additionalNotes', e.target.value); }} className="bg-zinc-800/50 border-zinc-700 text-white min-h-[80px]" placeholder="Additional notes..." />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-500">
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button onClick={handleSend} disabled={saving || !adminReport.verdict} className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                  <Send className="w-4 h-4 mr-2" /> Send to Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReportPage;

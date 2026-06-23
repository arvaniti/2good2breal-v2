import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shield, FileText, Clock, CheckCircle, Eye, LogOut, ChevronDown, ChevronUp, AlertTriangle, RefreshCw, User, Send, Printer, Trash2, Download, FileDown, Search, ExternalLink, GitCompare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import ProfileSeekerPage from './ProfileSeekerPage';
import ComparatorPage from './ComparatorPage';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function StatusBadge(props) {
  const status = props.status || 'pending';
  let className = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (status === 'in_review') className = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (status === 'completed') className = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  return React.createElement(Badge, { className }, status.replace('_', ' ').toUpperCase());
}

function TrustBadge(props) {
  const level = props.level || 'pending';
  const score = props.score;
  let className = 'bg-amber-500/20 text-amber-400';
  if (level === 'high') className = 'bg-emerald-500/20 text-emerald-400';
  if (level === 'low') className = 'bg-orange-500/20 text-orange-400';
  if (level === 'very_low') className = 'bg-red-500/20 text-red-400';
  const label = 'Score: ' + (score || 'N/A') + ' - ' + level.replace('_', ' ').toUpperCase();
  return React.createElement(Badge, { className }, label);
}

function FormDataDisplay(props) {
  const formData = props.formData;
  const photos = props.photos;
  if (!formData) return null;
  
  const entries = Object.entries(formData).filter(function(entry) { 
    // Filter out photos array from form data display
    return entry[1] && entry[0] !== 'photos'; 
  });
  
  // Fields that need larger display
  const largeFields = ['observations_concerns', 'message_substance', 'profile_bio', 'additional_notes'];
  
  return (
    <div className="bg-zinc-800/30 rounded-lg p-4 space-y-3">
      {entries.map(function(entry) {
        const key = entry[0];
        const value = entry[1];
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
        const isLargeField = largeFields.includes(key);
        
        if (isLargeField && displayValue.length > 50) {
          return (
            <div key={key} className="border-b border-zinc-700 pb-3">
              <span className="text-zinc-400 capitalize text-sm font-medium block mb-2">{key.replace(/_/g, ' ')}:</span>
              <div className="text-white text-sm bg-zinc-900/50 rounded-lg p-3 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                {displayValue}
              </div>
            </div>
          );
        }
        
        return (
          <div key={key} className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
            <span className="text-zinc-400 capitalize">{key.replace(/_/g, ' ')}:</span>
            <span className="text-white sm:text-right break-words sm:max-w-md">{displayValue}</span>
          </div>
        );
      })}
      
      {/* Display uploaded photos */}
      {photos && photos.length > 0 && (
        <div className="border-t border-zinc-700 pt-4 mt-4">
          <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
            📷 Uploaded Photos ({photos.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => {
              // Handle different photo data formats
              const photoSrc = photo.base64 || photo.data || photo.url || photo;
              const photoName = photo.name || photo.filename || `Photo ${index + 1}`;
              
              // Check if it's a valid image source
              const isValidSrc = typeof photoSrc === 'string' && (
                photoSrc.startsWith('data:image') || 
                photoSrc.startsWith('http') ||
                photoSrc.startsWith('/')
              );
              
              if (!isValidSrc) {
                return (
                  <div key={index} className="w-full h-32 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center">
                    <span className="text-zinc-500 text-xs text-center p-2">Photo {index + 1}<br/>(format non supporté)</span>
                  </div>
                );
              }
              
              return (
                <div key={index} className="relative group">
                  <img 
                    src={photoSrc} 
                    alt={photoName}
                    className="w-full h-32 object-cover rounded-lg border border-zinc-700 cursor-pointer hover:border-purple-500 transition-colors"
                    onClick={() => window.open(photoSrc, '_blank')}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-32 bg-zinc-800 rounded-lg border border-zinc-700 items-center justify-center">
                    <span className="text-zinc-500 text-xs">Image error</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg truncate">
                    {photoName}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-zinc-500 text-xs mt-2">Click on a photo to view full size</p>
        </div>
      )}
    </div>
  );
}

function AIDisplay(props) {
  const ai = props.ai;
  
  // Check if ai_analysis is null, undefined, or has an error
  if (!ai || ai.error || (typeof ai === 'object' && Object.keys(ai).length === 0)) {
    return (
      <div className="bg-zinc-800/30 rounded-lg p-4 text-center">
        <div className="text-amber-500 mb-2">
          <AlertTriangle className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-zinc-400 text-sm">
          {ai && ai.error ? 'AI analysis failed: ' + ai.error : 'AI analysis not available for this submission'}
        </p>
        <p className="text-zinc-500 text-xs mt-2">
          This may be an older submission before AI was enabled
        </p>
      </div>
    );
  }
  
  const score = ai.overall_score || 0;
  let scoreColor = 'text-red-400';
  let scoreBg = 'bg-red-500/10';
  if (score >= 70) {
    scoreColor = 'text-emerald-400';
    scoreBg = 'bg-emerald-500/10';
  } else if (score >= 40) {
    scoreColor = 'text-amber-400';
    scoreBg = 'bg-amber-500/10';
  }
  
  const trustLevel = ai.trust_level || 'unknown';
  const redFlags = ai.red_flags || [];
  const recommendations = ai.recommendations || [];
  const summary = ai.analysis_summary || '';
  
  return (
    <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
      {/* Score Header */}
      <div className={'rounded-lg p-4 ' + scoreBg}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-sm">Trust Score</span>
            <p className={'text-3xl font-bold ' + scoreColor}>{score}/100</p>
          </div>
          <div className="text-right">
            <span className="text-zinc-400 text-sm">Trust Level</span>
            <p className={'text-lg font-semibold capitalize ' + scoreColor}>
              {trustLevel.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      {summary ? (
        <div>
          <p className="text-purple-400 text-sm font-semibold mb-2">AI Summary:</p>
          <p className="text-white text-sm bg-zinc-900/50 p-3 rounded border border-zinc-700">
            {summary}
          </p>
        </div>
      ) : null}
      
      {/* Red Flags */}
      {redFlags.length > 0 ? (
        <div>
          <p className="text-red-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Red Flags Detected ({redFlags.length})
          </p>
          <div className="space-y-2">
            {redFlags.map(function(flag, idx) {
              const severityColor = flag.severity === 'high' ? 'border-red-500 bg-red-950/50' : 
                                   flag.severity === 'medium' ? 'border-amber-500 bg-amber-950/30' : 
                                   'border-yellow-500 bg-yellow-950/20';
              return (
                <div key={idx} className={'rounded p-3 border ' + severityColor}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium text-sm">{flag.category}</span>
                    <Badge className={
                      flag.severity === 'high' ? 'bg-red-500 text-white' :
                      flag.severity === 'medium' ? 'bg-amber-500 text-black' :
                      'bg-yellow-500 text-black'
                    }>
                      {flag.severity ? flag.severity.toUpperCase() : 'LOW'}
                    </Badge>
                  </div>
                  <p className="text-zinc-300 text-sm">{flag.description}</p>
                  {flag.recommendation ? (
                    <p className="text-zinc-400 text-xs mt-2 italic">
                      Recommendation: {flag.recommendation}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/30 rounded p-3">
          <p className="text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            No major red flags detected
          </p>
        </div>
      )}
      
      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div>
          <p className="text-teal-400 text-sm font-semibold mb-2">AI Recommendations:</p>
          <ul className="space-y-1">
            {recommendations.map(function(rec, idx) {
              return (
                <li key={idx} className="text-zinc-300 text-sm flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function AnalysisRow(props) {
  const navigate = useNavigate();
  const analysis = props.analysis;
  const expanded = props.expanded;
  const onToggle = props.onToggle;
  const onRefresh = props.onRefresh;
  
  const [deleting, setDeleting] = useState(false);
  
  const dateStr = analysis.created_at ? new Date(analysis.created_at).toLocaleString('fr-FR') : 'N/A';
  
  function handleCreateReport(e) {
    e.stopPropagation();
    navigate('/admin/report/' + analysis.id);
  }
  
  function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this submission?\n\nProfile: ' + analysis.profile_name + '\nClient: ' + analysis.user_email + '\n\nThis action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    const token = localStorage.getItem('admin_token');
    
    axios.delete(API + '/admin/analyses/' + analysis.id, {
      headers: { Authorization: 'Bearer ' + token }
    })
    .then(function() {
      toast.success('Submission deleted successfully');
      if (onRefresh) onRefresh();
    })
    .catch(function(err) {

      toast.error('Failed to delete submission');
    })
    .finally(function() {
      setDeleting(false);
    });
  }
  
  // Download PDF with authentication
  async function handleDownloadPDF(e) {
    e.stopPropagation();
    const token = localStorage.getItem('admin_token');
    try {
      const response = await axios.get(`${API}/admin/analyses/${analysis.id}/submission-pdf`, {
        headers: { Authorization: 'Bearer ' + token },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `submission_${analysis.profile_name?.replace(/\s+/g, '_') || 'profile'}_${analysis.id.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (err) {

      toast.error('Failed to download PDF');
    }
  }
  
  // Download DOCX with authentication
  async function handleDownloadDOCX(e) {
    e.stopPropagation();
    const token = localStorage.getItem('admin_token');
    const downloadUrl = `${API}/admin/analyses/${analysis.id}/submission-docx?token=${encodeURIComponent(token)}`;
    window.open(downloadUrl, '_self');
  }
  
  function handlePrint(e) {
    e.stopPropagation();
    const formData = analysis.form_data || {};
    
    // Helper function for gender display
    const genderDisplay = formData.gender ? (formData.gender === 'male' ? 'Male' : 'Female') : '-';
    
    // Build HTML as string (no document.write - XSS safe)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Profile Submission - ${(analysis.profile_name || '').replace(/[<>"'&]/g, '')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', 'Times New Roman', serif; padding: 40px; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #7c3aed; font-size: 28px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .date { text-align: right; color: #666; margin-bottom: 20px; font-size: 12px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { 
            color: #333; 
            padding: 8px 0; 
            font-size: 14px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            border-bottom: 2px solid #7c3aed; 
            text-decoration: underline; 
            text-underline-offset: 5px; 
          }
          .subsection-title { 
            font-weight: bold; 
            color: #333; 
            font-size: 12px; 
            text-transform: uppercase; 
            text-decoration: underline; 
            margin: 15px 0 10px 0; 
            letter-spacing: 0.5px; 
          }
          .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 30px; }
          .field { margin-bottom: 8px; }
          .field-label { font-weight: bold; color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .field-value { color: #333; padding: 4px 0; border-bottom: 1px dotted #ccc; min-height: 22px; font-size: 13px; }
          .field-full { grid-column: span 2; }
          .textarea-value { white-space: pre-wrap; background: #f8f8f8; padding: 12px; border-radius: 4px; min-height: 60px; border-left: 3px solid #7c3aed; font-size: 13px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #7c3aed; text-align: center; color: #666; font-size: 11px; }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="font-family: Arial, sans-serif;"><span style="font-size: 1.3em;">2</span>good<span style="font-size: 1.3em;">2</span>breal</h1>
          <p>Profile Verification Service - Submission Form</p>
        </div>
        
        <div class="date">${dateStr}</div>
        
        <!-- CLIENT INFORMATION - Underlined -->
        <div class="section">
          <div class="section-title">CLIENT INFORMATION</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Name</div>
              <div class="field-value">${analysis.user_name || formData.client_email?.split('@')[0] || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${formData.client_email || analysis.user_email || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Phone Number</div>
              <div class="field-value">${formData.client_phone || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Age</div>
              <div class="field-value">${formData.client_age || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Location</div>
              <div class="field-value">${formData.client_location || '-'}</div>
            </div>
          </div>
        </div>
        
        <!-- PROFILE INFORMATION - Underlined (no "Basic") -->
        <div class="section">
          <div class="section-title">PROFILE INFORMATION</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Profile Name</div>
              <div class="field-value">${formData.profile_name || analysis.profile_name || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Full Real Name</div>
              <div class="field-value">${formData.full_real_name || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Gender</div>
              <div class="field-value">${genderDisplay}</div>
            </div>
            <div class="field">
              <div class="field-label">Height</div>
              <div class="field-value">${formData.height || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Nationality</div>
              <div class="field-value">${formData.nationality || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Shared Language</div>
              <div class="field-value">${formData.language_of_communication || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Marital Status</div>
              <div class="field-value">${formData.assumed_marital_status || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Hobbies / Interests</div>
              <div class="field-value">${formData.hobbies_interests || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">University / College</div>
              <div class="field-value">${formData.university_college || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Year/s of Attendance / Graduation</div>
              <div class="field-value">${formData.years_attendance || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Phone Number / WhatsApp</div>
              <div class="field-value">${formData.phone_whatsapp || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${formData.profile_email || '-'}</div>
            </div>
          </div>
        </div>
        
        <!-- PROFILE DETAILS - Underlined -->
        <div class="section">
          <div class="section-title">PROFILE DETAILS</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Date of Birth</div>
              <div class="field-value">${formData.date_of_birth || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Known Age</div>
              <div class="field-value">${formData.assumed_age || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Location</div>
              <div class="field-value">${formData.profile_location || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Platform</div>
              <div class="field-value">${formData.dating_platform || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Occupation</div>
              <div class="field-value">${formData.occupation || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Company Name</div>
              <div class="field-value">${formData.company_name || '-'}</div>
            </div>
            <div class="field field-full">
              <div class="field-label">Company Website</div>
              <div class="field-value">${formData.company_website || '-'}</div>
            </div>
          </div>
          
          <!-- PROFILE BIO - Underlined -->
          <div class="subsection-title">PROFILE BIO</div>
          <div class="field-value textarea-value">${formData.profile_bio || '-'}</div>
        </div>
        
        <!-- PHOTOS AND SOCIAL MEDIA - Underlined -->
        <div class="section">
          <div class="section-title">PHOTOS AND SOCIAL MEDIA</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Number of Photos</div>
              <div class="field-value">${formData.profile_photos_count || (formData.photos ? formData.photos.length : 0) || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Verified Photos</div>
              <div class="field-value">${formData.has_verified_photos ? 'Yes' : 'No'}</div>
            </div>
            <div class="field field-full">
              <div class="field-label">Social Media Links (User names)</div>
              <div class="field-value textarea-value">${formData.social_media_links || '-'}</div>
            </div>
          </div>
          
          <!-- UPLOADED PHOTOS -->
          ${(formData.photos && formData.photos.length > 0) || (analysis.photos && analysis.photos.length > 0) ? `
          <div style="margin-top: 20px;">
            <div class="subsection-title">UPLOADED PHOTOS (${(formData.photos || analysis.photos || []).length})</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px;">
              ${(formData.photos || analysis.photos || []).map(function(photo, idx) {
                const photoSrc = photo.base64 || photo.data || photo.url || photo;
                const photoName = photo.name || photo.filename || 'Photo ' + (idx + 1);
                const isValidSrc = typeof photoSrc === 'string' && (photoSrc.startsWith('data:image') || photoSrc.startsWith('http'));
                if (!isValidSrc) return '';
                return '<div style="text-align: center; page-break-inside: avoid;"><img src="' + photoSrc + '" alt="' + photoName + '" style="max-width: 100%; max-height: 250px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" /><p style="font-size: 10px; color: #666; margin-top: 5px;">' + photoName + '</p></div>';
              }).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        
        <!-- ACTIVITY INFORMATION - Underlined -->
        <div class="section">
          <div class="section-title">ACTIVITY INFORMATION</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Profile Creation Date</div>
              <div class="field-value">${formData.profile_creation_date || '-'}</div>
            </div>
            <div class="field">
              <div class="field-label">Last Active</div>
              <div class="field-value">${formData.last_active || '-'}</div>
            </div>
          </div>
        </div>
        
        <!-- COMMUNICATION ANALYSIS - Underlined -->
        <div class="section">
          <div class="section-title">COMMUNICATION ANALYSIS</div>
          <div class="field-grid">
            <div class="field field-full">
              <div class="field-label">Communication Frequency</div>
              <div class="field-value textarea-value">${formData.communication_frequency || '-'}</div>
            </div>
            <div class="field field-full">
              <div class="field-label">Message Substance</div>
              <div class="field-value textarea-value">${formData.message_substance || '-'}</div>
            </div>
          </div>
        </div>
        
        <!-- OBSERVATIONS & CONCERNS - Underlined -->
        <div class="section">
          <div class="section-title">OBSERVATIONS & CONCERNS</div>
          <div class="field-value textarea-value">${formData.observations_concerns || '-'}</div>
        </div>
        
        ${analysis.ai_analysis ? `
        <!-- AI ANALYSIS SECTION -->
        <div class="ai-section" style="background: ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#f0fdf4' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#fefce8' : '#fef2f2'}; border: 2px solid ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#22c55e' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#eab308' : '#dc2626'}; border-radius: 8px; padding: 20px; margin-top: 30px; page-break-inside: avoid;">
          <div class="section-title" style="color: ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#166534' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#854d0e' : '#991b1b'}; border-bottom-color: ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#22c55e' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#eab308' : '#dc2626'};">AI ANALYSIS RESULTS</div>
          
          <!-- Trust Score Display -->
          <div style="text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 48px; font-weight: bold; color: ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#22c55e' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#eab308' : '#dc2626'};">${analysis.ai_analysis.overall_score || 0}/100</div>
            <div style="font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Trust Score</div>
            <div style="margin-top: 10px;">
              <span style="display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; background: ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#22c55e' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#eab308' : '#dc2626'}; color: ${(analysis.ai_analysis.overall_score || 0) >= 40 && (analysis.ai_analysis.overall_score || 0) < 70 ? '#000' : '#fff'};">
                ${(analysis.ai_analysis.trust_level || 'unknown').replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          <!-- AI Summary -->
          ${analysis.ai_analysis.analysis_summary ? `
          <div style="margin-bottom: 20px;">
            <div class="subsection-title" style="color: ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#166534' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#854d0e' : '#991b1b'};">AI Summary</div>
            <div class="textarea-value" style="border-left-color: ${(analysis.ai_analysis.overall_score || 0) >= 70 ? '#22c55e' : (analysis.ai_analysis.overall_score || 0) >= 40 ? '#eab308' : '#dc2626'};">${analysis.ai_analysis.analysis_summary}</div>
          </div>
          ` : ''}
          
          <!-- Red Flags -->
          ${analysis.ai_analysis.red_flags && analysis.ai_analysis.red_flags.length > 0 ? `
          <div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin-top: 15px;">
            <div style="color: #dc2626; font-weight: bold; margin-bottom: 12px; font-size: 13px; text-transform: uppercase;">⚠ Red Flags Detected (${analysis.ai_analysis.red_flags.length})</div>
            ${analysis.ai_analysis.red_flags.map(function(flag, idx) {
              const severityColor = flag.severity === 'high' ? '#dc2626' : flag.severity === 'medium' ? '#f97316' : '#eab308';
              const severityBg = flag.severity === 'high' ? '#fef2f2' : flag.severity === 'medium' ? '#fff7ed' : '#fefce8';
              return `
              <div style="background: ${severityBg}; border: 1px solid ${severityColor}; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-weight: bold; color: #333; font-size: 13px;">${flag.category || 'Unknown'}</span>
                  <span style="background: ${severityColor}; color: ${flag.severity === 'medium' || flag.severity === 'low' ? '#000' : '#fff'}; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${(flag.severity || 'low').toUpperCase()}</span>
                </div>
                <p style="color: #555; font-size: 12px; margin: 0;">${flag.description || ''}</p>
                ${flag.recommendation ? `<p style="color: #666; font-size: 11px; margin-top: 8px; font-style: italic;">Recommendation: ${flag.recommendation}</p>` : ''}
              </div>
              `;
            }).join('')}
          </div>
          ` : `
          <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 6px; padding: 12px; margin-top: 15px;">
            <p style="color: #166534; font-size: 13px; margin: 0;">✓ No major red flags detected</p>
          </div>
          `}
          
          <!-- Recommendations -->
          ${analysis.ai_analysis.recommendations && analysis.ai_analysis.recommendations.length > 0 ? `
          <div style="margin-top: 20px;">
            <div class="subsection-title" style="color: #0891b2;">AI Recommendations</div>
            <ul style="margin-left: 20px; font-size: 12px; color: #555;">
              ${analysis.ai_analysis.recommendations.map(function(rec) {
                return '<li style="margin-bottom: 5px;">' + rec + '</li>';
              }).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- RESEARCH AND VERIFICATIONS PERFORMED -->
        <div class="section" style="margin-top: 30px; page-break-inside: avoid;">
          <h2 style="color: #7c3aed; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">Research and Verifications performed include some of the following:</h2>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 15px;">
            <h3 style="color: #7c3aed; font-size: 14px; margin-bottom: 8px;">1. Platform Analysis</h3>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Intense scrutinizing of all platforms used by 'the profile' in the past and present.</p>
          </div>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 15px;">
            <h3 style="color: #7c3aed; font-size: 14px; margin-bottom: 8px;">2. Occupation Verification</h3>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Resourcing and authenticating profile's occupation via one on one discrete and direct communication means.</p>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Access to occupation and / or company official website through various complex and often unattainable platforms.</p>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Intense cross-checking of the profile's email addresses and user names worldwide.</p>
          </div>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 15px;">
            <h3 style="color: #7c3aed; font-size: 14px; margin-bottom: 8px;">3. Photo Identification</h3>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Photo identification via cross-checking of multiple image databases and reverse image search platforms.</p>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Detection and screening for multiple and stolen identities.</p>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Research and confirmation of all Profile Platforms, Locations and Residencies previously and in use today.</p>
          </div>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 15px;">
            <h3 style="color: #7c3aed; font-size: 14px; margin-bottom: 8px;">4. Location Verification</h3>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Verification of locations such as photo venues, background images and sceneries relating to where the profile claims to be or reside.</p>
          </div>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 15px;">
            <h3 style="color: #7c3aed; font-size: 14px; margin-bottom: 8px;">5. Location Cross Referencing</h3>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Cross referencing of all the profile's locations and personal details to detect any mismatched information.</p>
          </div>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 15px;">
            <h3 style="color: #7c3aed; font-size: 14px; margin-bottom: 8px;">6. Photo Authenticity</h3>
            <p style="font-size: 12px; color: #333; line-height: 1.6;">Clarity and authenticity of all photos provided by you and of those 2good2breal gains access to via websites, apps, platforms and other means.</p>
          </div>
        </div>
        
        <!-- OUR RECOMMENDATIONS -->
        <div class="section" style="margin-top: 30px; page-break-inside: avoid;">
          <h2 style="color: #7c3aed; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">Our Recommendations</h2>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 15px;">
            <p style="font-size: 12px; color: #333; margin-bottom: 10px;">Based on our analysis, we recommend:</p>
            <ul style="margin-left: 20px; font-size: 12px; color: #333; line-height: 1.8;">
              <li>Block and report the account on the platform,</li>
              <li>Save evidence such as screenshots and user names in the event you need to report it in future,</li>
              <li>Talk to someone you trust about the situation for support if you feel the need.</li>
              <li>Consider stepping back or ending the conversation and /or contact.</li>
            </ul>
            <p style="font-size: 12px; color: #333; margin: 15px 0; padding-left: 20px;">As the situation is extremely ambiguous, in our opinion, it is essential to walk away and disconnect.</p>
            <ul style="margin-left: 20px; font-size: 12px; color: #333; line-height: 1.8;">
              <li>If your situation with this profile has escalated to a point that you feel overwhelmed, do not hesitate to seek professional help.</li>
              <li>Keep your offline life grounded and intact.</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 15px;">
            <p style="font-size: 12px; color: #92400e; font-style: italic; line-height: 1.6;"><em>If you wish further analyzing of this profile, please provide us with more personal details such as extended family information, presumed previous occupations and subsequent history on your next request.</em></p>
          </div>
        </div>
        
        <!-- THANK YOU MESSAGE -->
        <div style="margin-top: 30px; padding: 25px; background: #fff; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; page-break-inside: avoid;">
          <h2 style="color: #7c3aed; font-size: 20px; font-weight: bold; margin-bottom: 15px; font-family: Arial, sans-serif;">Thank you for choosing <span style="font-size: 1.2em;">2</span>good<span style="font-size: 1.2em;">2</span>breal</h2>
          <p style="font-size: 12px; color: #333; line-height: 1.8; margin-bottom: 15px;">We hope this report assists to clarify, confirm or dismiss any doubts you may have of your Profile's authenticity or intentions.</p>
          <p style="font-size: 12px; color: #333; line-height: 1.8; margin-bottom: 20px;">Furthermore, our team aims to provide you with an objective, informative and reliable report to help guide you towards well founded and smart decision making with this person in future.</p>
          <p style="color: #7c3aed; font-size: 14px; font-weight: bold; margin-bottom: 20px;">All the best from our team at 2good2breal.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          
          <p style="font-size: 11px; color: #666;">Contact: contact@2good2breal.com</p>
          <p style="font-size: 11px; color: #666;">Report Reference: ${analysis.id || 'N/A'}</p>
          <p style="font-size: 10px; color: #888; font-style: italic; margin-top: 10px;">This analysis should not be considered as legal advice.</p>
        </div>
        
        <div class="footer">
          <p><strong style="font-family: Arial, sans-serif;"><span style="font-size: 1.2em;">2</span>good<span style="font-size: 1.2em;">2</span>breal</strong> - Profile Verification Service</p>
          <p>contact@2good2breal.com | +33 (0) 7 67 92 55 45 | www.2good2breal.com</p>
          <p style="margin-top: 10px; font-style: italic;">This document is confidential.</p>
        </div>
        
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    
    // Secure: Use iframe srcdoc directly (no document.write or window.open)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.srcdoc = htmlContent;
    
    iframe.onload = function() {
      setTimeout(function() {
        iframe.contentWindow.print();
        setTimeout(function() {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 250);
    };
    
    document.body.appendChild(iframe);
  }
  
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4 bg-zinc-800/30 cursor-pointer hover:bg-zinc-800/50" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{analysis.profile_name}</h3>
              <p className="text-zinc-400 text-sm">Client: {analysis.user_name} ({analysis.user_email})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={analysis.status} />
            {analysis.ai_analysis ? <TrustBadge level={analysis.ai_analysis.trust_level} score={analysis.ai_analysis.overall_score} /> : null}
            <span className="text-zinc-500 text-xs">{dateStr}</span>
            {expanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
          </div>
        </div>
      </div>
      
      {expanded ? (
        <div className="p-6 border-t border-zinc-800">
          {/* Action Buttons */}
          <div className="mb-4 flex justify-between">
            <Button onClick={handleDelete} disabled={deleting} variant="outline" className="border-red-600 text-red-400 hover:bg-red-950/50">
              <Trash2 className="w-4 h-4 mr-2" /> {deleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button onClick={handlePrint} variant="outline" className="border-zinc-600 hover:bg-zinc-800">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                variant="outline" 
                className="border-blue-600 text-blue-400 hover:bg-blue-950/50"
              >
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button 
                onClick={handleDownloadDOCX} 
                variant="outline" 
                className="border-green-600 text-green-400 hover:bg-green-950/50"
              >
                <FileDown className="w-4 h-4 mr-2" /> DOCX
              </Button>
              <Button onClick={handleCreateReport} className="bg-purple-600 hover:bg-purple-500">
                <Send className="w-4 h-4 mr-2" /> Create Report
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-purple-400 font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" /> Form Data
              </h4>
              <FormDataDisplay formData={analysis.form_data} photos={analysis.photos || analysis.form_data?.photos} />
            </div>
            <div>
              <h4 className="text-teal-400 font-semibold flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" /> AI Analysis
              </h4>
              <AIDisplay ai={analysis.ai_analysis} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('submissions');

  useEffect(function() {
    const token = localStorage.getItem('admin_token');
    if (!token) { 
      navigate('/login'); 
      return; 
    }
    
    axios.get(API + '/admin/analyses', { headers: { Authorization: 'Bearer ' + token } })
      .then(function(res) {
        setAnalyses(res.data);
        setLoading(false);
      })
      .catch(function(err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('admin_token');
          navigate('/login');
        }
        toast.error('Failed to load');
        setLoading(false);
      });
  }, [navigate]);

  function handleRefresh() {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setRefreshing(true);
    axios.get(API + '/admin/analyses', { headers: { Authorization: 'Bearer ' + token } })
      .then(function(res) {
        setAnalyses(res.data);
        setRefreshing(false);
        toast.success('Refreshed');
      })
      .catch(function() {
        setRefreshing(false);
      });
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    navigate('/login');
    toast.success('Logged out');
  }

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  const pending = analyses.filter(function(a) { return a.status === 'pending'; }).length;
  const inReview = analyses.filter(function(a) { return a.status === 'in_review'; }).length;
  const completed = analyses.filter(function(a) { return a.status === 'completed'; }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-purple-400 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" /> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-12" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-zinc-400">2good2breal - Profile Verification</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="border-zinc-700 text-zinc-300">
              <RefreshCw className={'w-4 h-4 mr-2 ' + (refreshing ? 'animate-spin' : '')} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-800 text-red-400">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{analyses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400">{pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">In Review</p>
                <p className="text-2xl font-bold text-blue-400">{inReview}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">{completed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={function() { setActiveTab('submissions'); }}
            className={'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (activeTab === 'submissions' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}
            data-testid="tab-submissions"
          >
            <FileText className="w-4 h-4" /> Profile Submissions
          </button>
          <button
            onClick={function() { setActiveTab('seeker'); }}
            className={'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (activeTab === 'seeker' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}
            data-testid="tab-profile-seeker"
          >
            <Search className="w-4 h-4" /> Profile Seeker
          </button>
          <button
            onClick={function() { setActiveTab('comparator'); }}
            className={'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (activeTab === 'comparator' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}
            data-testid="tab-comparator"
          >
            <GitCompare className="w-4 h-4" /> Comparator
          </button>
        </div>

        {activeTab === 'submissions' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" /> Profile Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No requests yet</div>
            ) : (
              <div className="space-y-4">
                {analyses.map(function(a) {
                  return (
                    <AnalysisRow 
                      key={a.id} 
                      analysis={a} 
                      expanded={expandedId === a.id} 
                      onToggle={function() { toggleExpand(a.id); }}
                      onRefresh={handleRefresh}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {activeTab === 'seeker' && (
          <ProfileSeekerPage />
        )}

        {activeTab === 'comparator' && (
          <ComparatorPage />
        )}
      </div>
    </div>
  );
}

export default AdminPage;

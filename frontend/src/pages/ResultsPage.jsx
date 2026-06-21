import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { ImageAnalysisCard } from '../components/ImageAnalysisCard';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Search,
  Clock,
  Trash2,
  ChevronRight,
  Printer
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getTrustColor(level) {
  if (level === 'high') return 'text-emerald-400';
  if (level === 'medium') return 'text-amber-400';
  if (level === 'low') return 'text-orange-400';
  if (level === 'very_low') return 'text-red-400';
  if (level === 'pending') return 'text-purple-400';
  return 'text-zinc-400';
}

function getTrustBg(level) {
  if (level === 'high') return 'bg-emerald-500';
  if (level === 'medium') return 'bg-amber-500';
  if (level === 'low') return 'bg-orange-500';
  if (level === 'very_low') return 'bg-red-500';
  if (level === 'pending') return 'bg-purple-500';
  return 'bg-zinc-500';
}

function getSeverityClass(sev) {
  if (sev === 'high') return 'bg-red-950/50 border-red-800/50 text-red-400';
  if (sev === 'medium') return 'bg-amber-950/50 border-amber-800/50 text-amber-400';
  if (sev === 'low') return 'bg-blue-950/50 border-blue-800/50 text-blue-400';
  return 'bg-zinc-900/50 border-zinc-800 text-zinc-400';
}

function getSeverityBadgeClass(sev) {
  if (sev === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (sev === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (sev === 'low') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
}

function getScoreColor(score) {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  if (score >= 30) return 'text-orange-400';
  return 'text-red-400';
}

function getScoreGradient(score) {
  if (score >= 70) return 'from-emerald-500 to-emerald-600';
  if (score >= 50) return 'from-amber-500 to-amber-600';
  if (score >= 30) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
}

function getCategoryLabel(key) {
  if (key === 'profile_completeness') return 'Profile Completeness';
  if (key === 'photo_analysis') return 'Photo Analysis';
  if (key === 'social_verification') return 'Social Verification';
  if (key === 'activity_patterns') return 'Activity Patterns';
  if (key === 'communication_quality') return 'Communication Quality';
  return key.replace(/_/g, ' ');
}

function RedFlagCard({ flag, idx, t }) {
  return (
    <div className={`p-4 rounded-xl border ${getSeverityClass(flag.severity)}`} data-testid={`red-flag-${idx}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-white">{flag.category}</h4>
            <Badge className={getSeverityBadgeClass(flag.severity)}>
              {t(`results.redFlags.severity.${flag.severity}`)}
            </Badge>
          </div>
          <p className="text-zinc-300 text-sm mb-2">{flag.description}</p>
          <p className="text-zinc-500 text-sm">
            <span className="font-medium text-zinc-400">Recommendation:</span> {flag.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ catKey, data }) {
  return (
    <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-300 font-medium">{getCategoryLabel(catKey)}</span>
        <span className={`font-bold ${getScoreColor(data.score)}`}>{data.score}/100</span>
      </div>
      <Progress value={data.score} className="h-2 bg-zinc-700" />
      <p className="text-zinc-500 text-sm mt-2">{data.notes}</p>
    </div>
  );
}

export function ResultsPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadResult = useCallback(async () => {
    try {
      const hdrs = getAuthHeaders();
      const res = await axios.get(`${API}/analyses/${id}`, hdrs);
      setResult(res.data);
    } catch (err) {

      toast.error(t('common.error'));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeaders, navigate, t]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  const doDelete = async () => {
    if (window.confirm('Delete this analysis?')) {
      try {
        await axios.delete(`${API}/analyses/${id}`, getAuthHeaders());
        toast.success('Deleted');
        navigate('/dashboard');
      } catch (err) {
        toast.error(t('common.error'));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="text-zinc-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (!result) return null;

  const flags = result.red_flags || [];
  const hasFlags = flags.length > 0;
  const detailed = result.detailed_analysis || {};
  const detailKeys = Object.keys(detailed);
  const recs = result.recommendations || [];
  const hasRecs = recs.length > 0;
  const imageAnalysis = result.image_analysis || null;
  const dateStr = new Date(result.created_at).toLocaleDateString();
  const timeStr = new Date(result.created_at).toLocaleTimeString();

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-12" data-testid="results-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white mb-4" data-testid="back-button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white" data-testid="results-title">{result.profile_name}</h1>
              <p className="text-zinc-400 flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                {dateStr} at {timeStr}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/analyze">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white" data-testid="new-analysis-btn">
                  <Search className="w-4 h-4 mr-2" />
                  {t('results.actions.newAnalysis')}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" 
                onClick={() => window.print()}
                data-testid="print-results-btn"
              >
                <Printer className="w-4 h-4 mr-2" />
                {t('results.actions.print')}
              </Button>
              <Button variant="outline" className="border-red-800/50 text-red-400 hover:bg-red-950/50" onClick={doDelete} data-testid="delete-analysis-btn">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 mb-6" data-testid="trust-score-card">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${getScoreGradient(result.overall_score)} p-1`}>
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                    <div className="text-center">
                      <span className={`text-5xl font-bold ${getScoreColor(result.overall_score)}`} data-testid="trust-score-value">{result.overall_score}</span>
                      <p className="text-zinc-500 text-sm mt-1">/100</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{t('results.trustScore')}</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getTrustBg(result.trust_level)}/20 border border-current/30 ${getTrustColor(result.trust_level)}`}>
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">{t(`results.trustLevel.${result.trust_level}`)}</span>
                </div>
                <p className="text-zinc-400 mt-4 max-w-xl">{result.analysis_summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 mb-6" data-testid="red-flags-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              {t('results.redFlags.title')}
              {hasFlags && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 ml-2">{flags.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasFlags ? (
              <div className="space-y-4">
                {flags.map((f, i) => <RedFlagCard key={i} flag={f} idx={i} t={t} />)}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-medium">{t('results.redFlags.noFlags')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <ImageAnalysisCard imageAnalysis={imageAnalysis} />

        <Card className="bg-zinc-900/50 border-zinc-800 mb-6" data-testid="detailed-analysis-card">
          <CardHeader>
            <CardTitle className="text-white">{t('results.detailedAnalysis')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detailKeys.map((k) => <CategoryCard key={k} catKey={k} data={detailed[k]} />)}
            </div>
          </CardContent>
        </Card>

        {hasRecs && (
          <Card className="bg-zinc-900/50 border-zinc-800" data-testid="recommendations-card">
            <CardHeader>
              <CardTitle className="text-white">{t('results.recommendations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recs.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Thank You Message */}
        <div className="mt-8 text-center py-6 border-t border-zinc-800" data-testid="thank-you-message">
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Thank you for choosing <span className="text-purple-400 font-medium">2good2breal.com</span>. We hope this Verification Report assists in guiding you towards clarity and good decision making.
          </p>
        </div>
      </div>
    </div>
  );
}

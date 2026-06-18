import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Brain, 
  AlertTriangle, 
  Award, 
  Filter,
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  ChevronRight,
  Heart,
  Clock,
  FileCheck,
  UserX,
  Lock,
  Star
} from 'lucide-react';

// Couple images for illustration
const coupleImages = [
  {
    url: "https://customer-assets.emergentagent.com/job_0b724c14-c97f-499b-b534-e1e0ccb2c8e2/artifacts/3vi1p925_Screenshot%202026-03-11%20at%2018.31.23.png",
    alt: "Happy young couple embracing"
  },
  {
    url: "https://customer-assets.emergentagent.com/job_70eab583-4996-47c5-9afc-5c9044f1456a/artifacts/ygie35w5_couple%202.PNG",
    alt: "Elegant couple toasting at dinner"
  },
  {
    url: "https://images.pexels.com/photos/8096475/pexels-photo-8096475.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Happy black couple sharing intimate moments"
  },
  {
    url: "https://customer-assets.emergentagent.com/job_70eab583-4996-47c5-9afc-5c9044f1456a/artifacts/psgcvyp7_couple.PNG",
    alt: "Happy mature couple embracing outdoors"
  }
];

export const LandingPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isFr = language === 'fr';

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 mb-8">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-zinc-400">AI-Powered Protection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight" style={{color: '#c084fc'}} data-testid="hero-title">
              {t('landing.hero.title')}
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-6 text-lg group"
                data-testid="get-started-btn"
              >
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-6 text-lg"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                {t('landing.hero.ctaSecondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-2">120K+</div>
              <div className="text-zinc-400">Database</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">97%</div>
              <div className="text-zinc-400">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-zinc-400">Manual Review</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - How We Protect You */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-800/50 transition-colors group" data-testid="feature-ai">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-950/50 flex items-center justify-center mb-4 group-hover:bg-purple-900/50 transition-colors">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('landing.features.aiAnalysis.title')}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {t('landing.features.aiAnalysis.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-800/50 transition-colors group" data-testid="feature-redflags">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-950/50 flex items-center justify-center mb-4 group-hover:bg-red-900/50 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('landing.features.redFlags.title')}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {t('landing.features.redFlags.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-amber-800/50 transition-colors group" data-testid="feature-scoring">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-amber-950/50 flex items-center justify-center mb-4 group-hover:bg-amber-900/50 transition-colors">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('landing.features.scoring.title')}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {t('landing.features.scoring.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-teal-800/50 transition-colors group" data-testid="feature-filters">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-950/50 flex items-center justify-center mb-4 group-hover:bg-teal-900/50 transition-colors">
                  <Filter className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('landing.features.filters.title')}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {t('landing.features.filters.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section - This Is Not A Dating Site (NOW AFTER FEATURES) */}
      <section className="py-20 sm:py-28 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-950/40 border-2 border-red-600/50 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-lg font-bold text-red-500 uppercase tracking-wide">{t('landing.about.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t('landing.about.title')}
            </h2>
          </div>

          {/* Main Content */}
          <div className="space-y-6 text-lg text-zinc-300 leading-relaxed">
            <p>{t('landing.about.description1')}</p>
            <p>{t('landing.about.description2')}</p>
            <p>{t('landing.about.description3')}</p>
            <p>{t('landing.about.description4')}</p>
            
            <div className="py-6 border-y border-zinc-800">
              <p className="text-xl text-white font-semibold">{t('landing.about.delivery')}</p>
            </div>

            {/* 48 Hours Delivery */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-950/50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-xl mb-2">48 Hours Delivery</p>
                  <p className="text-zinc-300">{t('landing.about.delivery')}</p>
                </div>
              </div>
            </div>

            <p>{t('landing.about.result')}</p>
            
            <div className="mt-4 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <p className="text-purple-400 font-bold text-lg mb-2">{t('landing.about.contactTitle')}</p>
              <p className="text-zinc-300">
                WhatsApp 1 : <a href="tel:+33743660555" className="text-purple-400 hover:text-purple-300 underline">+33 (0) 7 43 66 05 55</a>
              </p>
              <p className="text-zinc-300">
                WhatsApp 2 : <a href="tel:+33767925545" className="text-purple-400 hover:text-purple-300 underline">+33 (0) 7 67 92 55 45</a>
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-700">
                <p className="text-zinc-400 text-sm mb-2">{isFr ? "Langues parlées par notre équipe :" : "Languages spoken by our team:"}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 bg-zinc-700/50 px-2 py-1 rounded text-sm text-zinc-300">
                    <span className="text-base">🇬🇧</span> English
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-700/50 px-2 py-1 rounded text-sm text-zinc-300">
                    <span className="text-base">🇫🇷</span> Français
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-700/50 px-2 py-1 rounded text-sm text-zinc-300">
                    <span className="text-base">🇮🇹</span> Italiano
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-700/50 px-2 py-1 rounded text-sm text-zinc-300">
                    <span className="text-base">🇪🇸</span> Español
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-700/50 px-2 py-1 rounded text-sm text-zinc-300">
                    <span className="text-base">🇬🇷</span> Ελληνικά
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-xl font-semibold text-white">{t('landing.about.filter')}</p>
          </div>

          {/* Psychology Section - Scammer Types */}
          <div className="mt-12 bg-red-950/20 border-2 border-red-800/50 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserX className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-red-500">{t('landing.about.psychologyTitle')}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
                <span className="text-red-400 font-semibold text-sm">{t('landing.about.scammer1')}</span>
              </div>
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
                <span className="text-red-400 font-semibold text-sm">{t('landing.about.scammer2')}</span>
              </div>
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
                <span className="text-red-400 font-semibold text-sm">{t('landing.about.scammer3')}</span>
              </div>
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
                <span className="text-red-400 font-semibold text-sm">{t('landing.about.scammer4')}</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <Lock className="w-6 h-6 text-purple-400" />
              <span className="text-zinc-300 font-medium">{t('landing.about.trust1')}</span>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <FileCheck className="w-6 h-6 text-purple-400" />
              <span className="text-zinc-300 font-medium">{t('landing.about.trust2')}</span>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <span className="text-zinc-300 font-medium">{t('landing.about.trust3')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories / Couple Gallery Section */}
      <section className="py-20 sm:py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-950/30 border border-pink-800/30 mb-4">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-pink-400">{t('landing.couples.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landing.couples.title')}
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              {t('landing.couples.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {coupleImages.map((img, idx) => (
              <div 
                key={idx}
                className="relative group overflow-hidden rounded-2xl aspect-square"
              >
                <img 
                  src={img.url} 
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-white">{t('landing.couples.verified')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landing.howItWorks.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative" data-testid="step-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/30">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('landing.howItWorks.step1.title')}
                </h3>
                <p className="text-zinc-400">
                  {t('landing.howItWorks.step1.description')}
                </p>
              </div>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-600/50 to-transparent -translate-x-8" />
            </div>

            {/* Step 2 */}
            <div className="relative" data-testid="step-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center mb-6 shadow-lg shadow-teal-900/30">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('landing.howItWorks.step2.title')}
                </h3>
                <p className="text-zinc-400">
                  {t('landing.howItWorks.step2.description')}
                </p>
              </div>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-teal-600/50 to-transparent -translate-x-8" />
            </div>

            {/* Step 3 */}
            <div data-testid="step-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/30">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('landing.howItWorks.step3.title')}
                </h3>
                <p className="text-zinc-400">
                  {t('landing.howItWorks.step3.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summer Romance Promotional Banner */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-2xl shadow-purple-900/20"
            onClick={handleGetStarted}
            data-testid="summer-promo-banner"
          >
            <img 
              src="/summer-promo.jpg"
              alt="Safeguard Your Summer Romance - Verify Discreetly"
              className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/30 border border-purple-800/30 mb-4">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400">{t('landing.testimonials.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-800/50 transition-colors">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 italic">"{t('landing.testimonials.review1')}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div>
                  <p className="text-white font-medium">Sophie M.</p>
                  <p className="text-zinc-500 text-sm">Paris, France</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-800/50 transition-colors">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 italic">"{t('landing.testimonials.review2')}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <div>
                  <p className="text-white font-medium">Marc D.</p>
                  <p className="text-zinc-500 text-sm">Geneva, Switzerland</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-800/50 transition-colors">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 italic">"{t('landing.testimonials.review3')}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  I
                </div>
                <div>
                  <p className="text-white font-medium">Isabella R.</p>
                  <p className="text-zinc-500 text-sm">Rome, Italy</p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-800/50 transition-colors">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 italic">"{t('landing.testimonials.review4')}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  P
                </div>
                <div>
                  <p className="text-white font-medium">Philippe T.</p>
                  <p className="text-zinc-500 text-sm">Marseille, France</p>
                </div>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-800/50 transition-colors">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 italic">"{t('landing.testimonials.review5')}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white font-semibold">
                  C
                </div>
                <div>
                  <p className="text-white font-medium">Caroline L.</p>
                  <p className="text-zinc-500 text-sm">Berlin, Germany</p>
                </div>
              </div>
            </div>

            {/* Testimonial 6 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-800/50 transition-colors">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 italic">"{t('landing.testimonials.review6')}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                  J
                </div>
                <div>
                  <p className="text-white font-medium">Jean-Pierre B.</p>
                  <p className="text-zinc-500 text-sm">Monaco</p>
                </div>
              </div>
            </div>

            {/* Testimonial 8 - Natalia Full Width */}
            <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-purple-950/30 to-zinc-900/50 border border-purple-800/30 rounded-2xl p-6 hover:border-purple-700/50 transition-colors">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 italic leading-relaxed">"{t('landing.testimonials.review8')}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  N
                </div>
                <div>
                  <p className="text-white font-medium">Natalia</p>
                  <p className="text-zinc-500 text-sm">Moscow, Russia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-3xl border border-zinc-800 p-12 sm:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-transparent to-teal-950/20" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('landing.cta.title')}
              </h2>
              <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
                {t('landing.cta.subtitle')}
              </p>
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-6 text-lg"
                data-testid="cta-create-account"
              >
                {t('landing.cta.button')}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="2good2breal Logo" 
                className="h-[103px] w-auto"
              />
              <span className="text-2xl font-bold text-white tracking-tight font-sans">
                <span className="text-3xl">2</span>good<span className="text-3xl">2</span>breal
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link to="/terms" className="text-zinc-400 hover:text-white text-sm transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to="/cgv" className="text-zinc-400 hover:text-white text-sm transition-colors">
                {t('footer.cgv')}
              </Link>
              <Link to="/cookies" className="text-zinc-400 hover:text-white text-sm transition-colors">
                {t('footer.cookies')}
              </Link>
              <Link to="/faq" className="text-zinc-400 hover:text-white text-sm transition-colors">
                FAQ
              </Link>
              <p className="text-zinc-500 text-sm">
                © 2026 2good2breal. {t('footer.rights')}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <button
        onClick={() => window.open("https://wa.me/33743660555?text=Hello%2C%20I%20am%20interested%20to%20make%20a%20personal%20enquiry%20and%20receive%20information%20about%20profile%20submission.", "_blank", "noopener")}
        data-testid="whatsapp-float-btn"
        className="fixed bottom-6 left-6 z-50 group border-none bg-transparent cursor-pointer"
        aria-label="Contact us on WhatsApp"
      >
        <div className="relative">
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />
          {/* Button */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-110 transition-all duration-300 cursor-pointer">
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.129 6.744 3.047 9.379L1.054 31.25l6.1-1.953A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16.004 32 7.176 24.826 0 16.004 0zm9.338 22.617c-.387 1.09-1.922 1.996-3.137 2.262-.832.176-1.918.317-5.574-1.2-4.676-1.937-7.687-6.672-7.922-6.984-.226-.312-1.89-2.52-1.89-4.808 0-2.289 1.196-3.414 1.62-3.879.387-.422.918-.618 1.226-.618.152 0 .289.008.414.016.421.019.633.043 .91.707.348.832 1.196 2.91 1.3 3.121.105.215.2.496.063.793-.128.3-.24.488-.473.753-.234.266-.48.473-.714.762-.215.254-.457.527-.196.95.262.421 1.164 1.918 2.5 3.109 1.718 1.53 3.164 2.004 3.613 2.227.348.176.762.148.996-.09.3-.304.672-.809 1.05-1.31.27-.355.605-.398.984-.238.383.156 2.43 1.145 2.847 1.355.418.21.695.312.797.484.102.176.102.996-.285 2.09z"/>
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

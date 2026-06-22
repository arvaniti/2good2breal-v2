import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./i18n/LanguageContext";
import { Navbar } from "./components/Navbar";
import { SEOHead } from "./components/SEOHead";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from "./pages/AuthPages";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { ResultsPage } from "./pages/ResultsPage";
import { FiltersPage } from "./pages/FiltersPage";
import { HistoryPage } from "./pages/HistoryPage";
import { TermsPage } from "./pages/TermsPage";
import { CGVPage } from "./pages/CGVPage";
import { CookiesPage } from "./pages/CookiesPage";
import { PricingPage } from "./pages/PricingPage";
import { PaymentSuccessPage, PaymentCancelPage } from "./pages/PaymentPages";
import { AdminPage } from "./pages/AdminPage";
import { AdminReportPage } from "./pages/AdminReportPage";
import FAQPage from "./pages/FAQPage";
import RefundRequestPage from "./pages/RefundRequestPage";
import { PromotionPage } from "./pages/PromotionPage";
import CookieConsent from "./components/CookieConsent";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route - redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <>
      <SEOHead />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/analyze" element={
          <ProtectedRoute>
            <AnalyzePage />
          </ProtectedRoute>
        } />
        <Route path="/results/:id" element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        } />
        <Route path="/filters" element={
          <ProtectedRoute>
            <FiltersPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cgv" element={<CGVPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/refund-request" element={<RefundRequestPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/promotion" element={<PromotionPage />} />
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/report/:analysisId" element={<AdminReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App dark">
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
          <Toaster 
            position="top-right" 
            theme="dark"
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#fafafa'
              }
            }}
          />
          <CookieConsent />
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;

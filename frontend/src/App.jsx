import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { StudentProvider } from "./context/StudentContext";
import Navbar from "./components/Navbar";
import AIAssistant from "./components/AIAssistant";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import DashboardPage from "./pages/DashboardPage";
import SOPPage from "./pages/SOPPage";
import LoanPage from "./pages/LoanPage";
import AICredibilityPage from "./pages/AICredibilityPage";
import ScholarshipPage from "./pages/ScholarshipPage";
import VisaPage from "./pages/VisaPage";
import DocumentPage from "./pages/DocumentPage";
import BudgetPage from "./pages/BudgetPage";
import InterviewPage from "./pages/InterviewPage";

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("code") && location.pathname !== "/login") {
      navigate(`/login${location.search}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai-credibility" element={<AICredibilityPage />} />
        <Route path="/sop" element={<SOPPage />} />
        <Route path="/loan" element={<LoanPage />} />
        <Route path="/scholarships" element={<ScholarshipPage />} />
        <Route path="/visa" element={<VisaPage />} />
        <Route path="/documents" element={<DocumentPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/interview" element={<InterviewPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <Router>
        <div className="min-h-screen" style={{ background: "#050E1F" }}>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#112240", color: "#fff", border: "1px solid rgba(0,212,184,0.3)" },
            }}
          />
          <AIAssistant />
        </div>
      </Router>
    </StudentProvider>
  );
}

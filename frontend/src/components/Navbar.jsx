import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { student, updateStudent } = useStudent();
  const [theme, setTheme] = useState(() => localStorage.getItem("studyPathTheme") || "dark");
  const location = useLocation();
  const navigate = useNavigate();
  const links = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/ai-credibility", label: "About AI" },
    { path: "/sop", label: "SOP Studio" },
    { path: "/loan", label: "Loan Bridge" },
    { path: "/scholarships", label: "Scholarships" },
    { path: "/visa", label: "Visa Guide" },
    { path: "/documents", label: "Documents" },
    { path: "/budget", label: "Budget Calc" },
    { path: "/interview", label: "Interview Prep" },
  ];

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("studyPathTheme", theme);
  }, [theme]);

  const handleLogout = () => {
    updateStudent({ 
      name: "",
      email: "",
      gpa: "",
      gre: "",
      ielts: "",
      budget: "",
      targetCountry: "",
      preferredField: "",
      workExperience: "",
      dreamScore: null,
      matchedUniversities: [],
      journeyPlan: [],
      loanEligibility: null,
      admitData: null,
      streakDays: 3,
      completedTasks: [],
      isAuthenticated: false
    });
    localStorage.removeItem("studentProfile");
    navigate("/");
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-teal-400/10">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-900 font-bold text-sm" style={{ background: "#00D4B8" }}>S</div>
        <span className="font-display text-lg font-bold text-white">StudyPath <span style={{ color: "#00D4B8" }}>AI</span></span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {links.map((l) => (
          <Link key={l.path} to={l.path}
            className={`text-sm font-medium transition-colors ${location.pathname === l.path ? "text-teal-400" : "text-gray-400 hover:text-white"}`}
            style={{ color: location.pathname === l.path ? "#00D4B8" : undefined }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {student.isAuthenticated && student.name && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,212,184,0.1)", border: "1px solid rgba(0,212,184,0.3)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#00D4B8", color: "#050E1F" }}>
              {student.name[0]}
            </div>
            <span className="text-sm text-white">{student.name}</span>
            {student.streakDays > 0 && (
              <span className="text-xs" style={{ color: "#FFD166" }}>🔥 {student.streakDays}</span>
            )}
          </div>
        )}
        {student.isAuthenticated ? (
          <>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="btn-secondary text-sm py-2 px-4">
              {theme === "dark" ? "Bright" : "Dark"}
            </button>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="btn-secondary text-sm py-2 px-4">
              {theme === "dark" ? "Bright" : "Dark"}
            </button>
            <Link to="/login">
              <button className="btn-secondary text-sm py-2 px-4">Sign In</button>
            </Link>
            <Link to="/onboarding">
              <button className="btn-primary text-sm py-2 px-4">Get Started</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

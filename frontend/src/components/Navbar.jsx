import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { student, updateStudent } = useStudent();
  const [theme, setTheme] = useState(() => localStorage.getItem("studyPathTheme") || "dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav className={`sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between border-b transition-all duration-300 ${
      scrolled 
        ? "glass border-teal-400/20 backdrop-blur-md" 
        : "glass border-teal-400/10"
    }`}>
      <Link to="/" className="flex items-center gap-2 hover-glow">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-900 font-bold text-sm animate-bounce-light" style={{ background: "#00D4B8" }}>S</div>
        <span className="font-display text-lg font-bold text-white hidden sm:inline">
          StudyPath <span style={{ color: "#00D4B8" }}>AI</span>
        </span>
        <span className="font-display text-lg font-bold text-white sm:hidden" style={{ color: "#00D4B8" }}>SA</span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-1 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,184,0.1)" }}>
        {links.map((l) => (
          <Link key={l.path} to={l.path}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
              location.pathname === l.path 
                ? "text-navy-900 font-semibold" 
                : "text-gray-400 hover:text-white"
            }`}
            style={{
              background: location.pathname === l.path ? "#00D4B8" : "transparent",
              color: location.pathname === l.path ? "#050E1F" : undefined
            }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Desktop Auth & Theme */}
      <div className="hidden sm:flex items-center gap-3">
        {student.isAuthenticated && student.name && (
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#00D4B8", color: "#050E1F" }}>
              {student.name[0]}
            </div>
            <span className="text-sm text-white hidden sm:inline">{student.name}</span>
            {student.streakDays > 0 && (
              <span className="text-xs" style={{ color: "#FFD166" }}>🔥</span>
            )}
          </motion.div>
        )}
        
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          className="btn-secondary text-sm py-2 px-4"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        
        {student.isAuthenticated ? (
          <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">
              <button className="btn-secondary text-sm py-2 px-4">Sign In</button>
            </Link>
            <Link to="/onboarding">
              <button className="btn-primary text-sm py-2 px-4">Get Started</button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex lg:hidden items-center gap-2">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          className="p-2 rounded-lg hover:glass transition-all"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:glass transition-all"
        >
          <motion.div
            animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </motion.div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 right-4 w-72 glass-card p-4 rounded-xl space-y-2 lg:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === l.path 
                    ? "bg-teal-400/20 text-teal-400 border border-teal-400/50"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            
            <hr className="border-teal-400/10 my-3" />
            
            {student.isAuthenticated ? (
              <>
                {student.name && (
                  <div className="px-4 py-2 text-sm text-gray-300">
                    Hello, <span className="text-teal-400 font-semibold">{student.name}</span>
                    {student.streakDays > 0 && <span className="ml-2">🔥 {student.streakDays}</span>}
                  </div>
                )}
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full btn-secondary text-sm py-2 px-4 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full btn-secondary text-sm py-2 px-4 text-left">Sign In</button>
                </Link>
                <Link to="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full btn-primary text-sm py-2 px-4 text-left">Get Started</button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

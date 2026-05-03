import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { student, updateStudent } = useStudent();
  const [theme, setTheme] = useState(() => localStorage.getItem("studyPathTheme") || "dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const mainLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/ai-credibility", label: "About AI" },
  ];

  const toolLinks = [
    { path: "/sop", label: "SOP Studio" },
    { path: "/loan", label: "Loan Bridge" },
    { path: "/scholarships", label: "Scholarships" },
    { path: "/visa", label: "Visa Guide" },
    { path: "/documents", label: "Documents" },
    { path: "/budget", label: "Budget Calc" },
    { path: "/interview", label: "Interview Prep" },
  ];

  const allLinks = [...mainLinks, ...toolLinks];

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <nav className={`sticky top-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between border-b transition-all duration-300 ${
      scrolled 
        ? "glass border-teal-400/20 backdrop-blur-xl" 
        : "glass border-transparent backdrop-blur-sm"
    }`}>
      <Link to="/" className="flex items-center gap-3 hover-glow group">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-navy-900 font-bold text-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
          S
        </div>
        <span className="font-display text-xl font-bold text-white hidden sm:inline tracking-wide">
          StudyPath <span className="gradient-text">AI</span>
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-2 px-6 py-2 rounded-2xl glass-card border border-teal-400/10">
        {mainLinks.map((l) => (
          <Link key={l.path} to={l.path}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
              location.pathname === l.path 
                ? "bg-teal-400 text-navy-900 shadow-md shadow-teal-400/20" 
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}>
            {l.label}
          </Link>
        ))}

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setToolsOpen(!toolsOpen)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-1 ${
              toolLinks.some(l => l.path === location.pathname)
                ? "bg-teal-400/20 text-teal-400"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Tools
            <svg className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <AnimatePresence>
            {toolsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-3 w-48 glass-card border border-teal-400/20 rounded-xl overflow-hidden shadow-2xl py-2 flex flex-col"
              >
                {toolLinks.map((l) => (
                  <Link key={l.path} to={l.path}
                    onClick={() => setToolsOpen(false)}
                    className={`px-4 py-2.5 text-sm transition-all duration-200 ${
                      location.pathname === l.path
                        ? "bg-teal-400/10 text-teal-400 font-semibold border-l-2 border-teal-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Auth & Theme */}
      <div className="hidden sm:flex items-center gap-4">
        {student.isAuthenticated && student.name && (
          <motion.div 
            className="flex items-center gap-3 px-4 py-2 rounded-full glass-card border border-teal-400/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-teal-400 text-navy-900 shadow-sm">
              {student.name[0]}
            </div>
            <span className="text-sm font-medium text-white">{student.name}</span>
            {student.streakDays > 0 && (
              <span className="text-xs flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full text-gold">🔥 {student.streakDays}</span>
            )}
          </motion.div>
        )}
        
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          className="w-10 h-10 rounded-xl flex items-center justify-center glass-card hover:bg-white/10 transition-colors border border-teal-400/20"
          title="Toggle Theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        
        {student.isAuthenticated ? (
          <button onClick={handleLogout} className="btn-secondary text-sm">
            Logout
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</button>
            </Link>
            <Link to="/onboarding">
              <button className="btn-primary text-sm shadow-lg shadow-teal-400/20">Get Started</button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex lg:hidden items-center gap-3">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          className="w-10 h-10 rounded-xl flex items-center justify-center glass-card border border-teal-400/20"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-xl flex items-center justify-center glass-card border border-teal-400/20 text-white"
        >
          <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }}>
            {mobileMenuOpen ? "✕" : "☰"}
          </motion.div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 glass-card !rounded-none !border-r-0 border-l border-teal-400/20 p-6 flex flex-col z-50 shadow-2xl lg:hidden"
            style={{ top: "72px", height: "calc(100vh - 72px)" }}
          >
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {allLinks.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === l.path 
                      ? "bg-teal-400/10 text-teal-400 border border-teal-400/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            
            <div className="pt-6 mt-6 border-t border-teal-400/10">
              {student.isAuthenticated ? (
                <div className="space-y-4">
                  {student.name && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-teal-400 text-navy-900">
                        {student.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{student.name}</span>
                        {student.streakDays > 0 && <span className="text-xs text-gold">🔥 {student.streakDays} Day Streak</span>}
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full btn-secondary py-3 text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full btn-secondary py-3">Sign In</button>
                  </Link>
                  <Link to="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full btn-primary py-3">Get Started</button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

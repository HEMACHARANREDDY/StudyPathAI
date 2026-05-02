import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStudent } from "../context/StudentContext";
import toast from "react-hot-toast";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [demoEmail, setDemoEmail] = useState("student@example.com");
  const [showDemoMode, setShowDemoMode] = useState(false);
  const { updateStudent } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleStatus = params.get("google");
    const googleEmail = params.get("email");
    const message = params.get("message");

    if (googleStatus === "error") {
      toast.error(message || "Google login failed - use demo login to test");
      // Auto-show demo mode if Google login fails
      setShowDemoMode(true);
      window.history.replaceState({}, "", "/login");
      return;
    }

    if (googleStatus === "success" && googleEmail) {
      const hydrateGoogleUser = async () => {
        try {
          setLoading(true);
          toast.loading("Loading your Google profile...");

          const response = await fetch("/api/auth/get-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: googleEmail }),
          });

          const data = await response.json();

          if (!response.ok) {
            toast.dismiss();
            toast.error(data.error || "Could not load Google profile");
            setLoading(false);
            window.history.replaceState({}, "", "/login");
            return;
          }

          const userData = data.user;
          updateStudent({
            ...userData,
            lastLogin: new Date().toISOString(),
            isAuthenticated: true,
          });

          toast.dismiss();
          toast.success(`Welcome, ${userData.name || "Student"}!`);
          setLoading(false);
          window.history.replaceState({}, "", "/login");
          navigate(userData.name || userData.gpa ? "/dashboard" : "/onboarding");
        } catch (err) {
          toast.dismiss();
          toast.error("Google login error: " + err.message);
          setLoading(false);
          window.history.replaceState({}, "", "/login");
        }
      };

      hydrateGoogleUser();
    }
  }, [navigate, updateStudent]);

  const handleGoogleRedirect = () => {
    setLoading(true);
    window.location.href = "/api/auth/google-start?flow=login&origin=" + encodeURIComponent(window.location.origin);
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      toast.loading("Logging in with demo account...");

      const response = await fetch("/api/auth/get-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss();
        toast.error(data.error || "Demo login failed");
        setLoading(false);
        return;
      }

      const userData = data.user;
      updateStudent({
        ...userData,
        lastLogin: new Date().toISOString(),
        isAuthenticated: true,
      });

      toast.dismiss();
      toast.success(`Welcome, ${userData.name || "Student"}!`);
      setLoading(false);
      navigate(userData.name || userData.gpa ? "/dashboard" : "/onboarding");
    } catch (err) {
      toast.dismiss();
      toast.error("Demo login error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8" style={{ background: "rgba(17, 34, 64, 0.88)" }}>
          <h1 className="font-display text-3xl font-bold text-white mb-3 text-center">StudyPath AI</h1>
          <p className="text-gray-400 text-center mb-6">Sign in to continue your study abroad journey.</p>

          {!showDemoMode ? (
            <>
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg text-sm text-blue-400">
                <p>👉 For quick testing, use <strong>Demo Login</strong> below (recommended)</p>
              </div>

              <button
                onClick={handleGoogleRedirect}
                disabled={loading}
                className="w-full px-4 py-4 rounded-2xl text-white text-base font-semibold transition-all bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:opacity-60 mb-3"
              >
                {loading ? "Redirecting..." : "Continue with Google"}
              </button>

              <button
                onClick={() => setShowDemoMode(true)}
                className="w-full px-4 py-3 rounded-2xl text-white text-base font-semibold transition-all bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                ⚡ Demo Login (No setup needed)
              </button>

              <div className="mt-4 text-center text-xs text-gray-400">
                <p>💡 Need Google login? See GOOGLE_OAUTH_SETUP.md in the project folder</p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg text-sm text-green-400">
                  <p>✅ Demo login - creates a temporary test account instantly</p>
                </div>

                <input
                  type="email"
                  placeholder="Enter demo email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-teal-400 focus:outline-none"
                />

                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full px-4 py-4 rounded-2xl text-white text-base font-semibold transition-all bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "✨ Login with Demo Account"}
                </button>

                <button
                  onClick={() => setShowDemoMode(false)}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition-colors py-2"
                >
                  Back to Google login
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

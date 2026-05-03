import { useStudent } from "../context/StudentContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import toast from "react-hot-toast";

const DEMO_STUDENT = {
  name: "Hema Charan Reddy",
  gpa: "8.1",
  gre: "318",
  ielts: "7.5",
  budget: "65",
  targetCountry: "USA",
  preferredField: "Computer Science",
  dreamScore: 78,
  streakDays: 3,
  completedTasks: ["task1", "task2"],
  matchedUniversities: [
    {
      name: "University of Toronto",
      country: "Canada",
      rank: 18,
      admitChance: 74,
      tuition: "₹42L",
      field: "Computer Science",
      logo: "🍁"
    },
    {
      name: "Carnegie Mellon University",
      country: "USA",
      rank: 25,
      admitChance: 61,
      tuition: "₹68L",
      field: "Computer Science",
      logo: "🦁"
    },
    {
      name: "University of Edinburgh",
      country: "UK",
      rank: 32,
      admitChance: 83,
      tuition: "₹38L",
      field: "Computer Science",
      logo: "🏰"
    }
  ],
  journeyPlan: [
    { month: "Month 1–2", task: "Finalize GRE/IELTS prep schedule", status: "current", priority: "high" },
    { month: "Month 3", task: "Give GRE exam", status: "upcoming", priority: "high" },
    { month: "Month 4", task: "Research and shortlist 8 universities", status: "upcoming", priority: "medium" },
    { month: "Month 5–6", task: "Draft SOP with AI feedback", status: "upcoming", priority: "high" },
    { month: "Month 7", task: "Request Letters of Recommendation", status: "upcoming", priority: "medium" },
    { month: "Month 8–9", task: "Submit all applications", status: "upcoming", priority: "high" },
    { month: "Month 10", task: "Apply for scholarships", status: "upcoming", priority: "medium" },
    { month: "Month 11", task: "Receive admits — trigger loan", status: "upcoming", priority: "high" },
    { month: "Month 12", task: "Accept offer & prepare departure", status: "upcoming", priority: "high" }
  ]
};

export default function DashboardPage() {
  const { student: rawStudent, updateStudent } = useStudent();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    gpa: "",
    gre: "",
    ielts: "",
    budget: "",
    targetCountry: "",
    preferredField: "",
    workExperience: "",
  });

  useEffect(() => {
    if (rawStudent?.isAuthenticated) {
      const timer = setTimeout(() => {
        setLoaded(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [rawStudent?.isAuthenticated]);

  const isNewUser = !rawStudent?.gpa && !rawStudent?.gre && !rawStudent?.ielts;

  const handleProfileChange = (e) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async () => {
    try {
      updateStudent({
        ...rawStudent,
        ...profileFormData,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (!rawStudent?.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass-card p-10 max-w-xl text-center" style={{ background: "rgba(17, 34, 64, 0.9)" }}>
          <h1 className="font-display text-3xl font-bold text-white mb-4">Please sign in to continue</h1>
          <p className="text-gray-400 mb-8">
            You need to log in with Google before you can view your dashboard and personalized study path.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-2xl"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const student = rawStudent;

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full border-4 border-teal-400/20 border-t-teal-400 mb-4"
        />
        <div className="font-display text-3xl text-white mb-4 animate-pulse">Loading...</div>
        <p className="text-gray-400 mb-6">Fetching your personalized study path...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white dark:text-white light:text-slate-900">
              Welcome back, <span className="text-teal-500">{student.name}</span>!
            </h1>
            <p className="text-gray-400 mt-1">
              {student.lastLogin
                ? `Last login: ${new Date(student.lastLogin).toLocaleDateString()}`
                : "Your study-abroad journey is on track. 🚀"}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-xl text-sm font-medium bg-yellow-500/10 border border-yellow-600/30 text-yellow-600">
              🔥 {student.streakDays} day streak
            </div>
            <div className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-500/10 border border-teal-600/30 text-teal-600">
              {student.targetCountry ? `🎯 Target: ${student.targetCountry}` : "🎯 Target: USA"}
            </div>
            <Link to="/ai-credibility">
              <div className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-500/10 border border-purple-600/30 text-purple-600">
                ✓ About Our AI
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* NEW USER PROFILE SETUP */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30"
        >
          <h2 className="text-2xl font-bold text-white mb-2">👋 Welcome to StudyPath AI!</h2>
          <p className="text-gray-400 mb-6">Let's start by understanding your profile. This helps us provide personalized recommendations.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GPA (out of 10)</label>
              <input
                type="number"
                name="gpa"
                value={profileFormData.gpa}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                placeholder="8.5"
                step="0.1"
                min="0"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GRE Score</label>
              <input
                type="number"
                name="gre"
                value={profileFormData.gre}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                placeholder="320"
                min="260"
                max="340"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">IELTS Score</label>
              <input
                type="number"
                name="ielts"
                value={profileFormData.ielts}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                placeholder="7.5"
                step="0.5"
                min="0"
                max="9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Budget (₹ in Lakhs)</label>
              <input
                type="number"
                name="budget"
                value={profileFormData.budget}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Country</label>
              <select
                name="targetCountry"
                value={profileFormData.targetCountry}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">Select Country</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Field</label>
              <select
                name="preferredField"
                value={profileFormData.preferredField}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">Select Field</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Medicine">Medicine</option>
                <option value="Arts">Arts</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Work Experience (years)</label>
              <input
                type="number"
                name="workExperience"
                value={profileFormData.workExperience}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <button
            onClick={handleProfileSubmit}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            ✨ Complete My Profile
          </button>
        </motion.div>
      )}

      {/* Show returning user data */}
      {!isNewUser && student.createdAt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8 bg-teal-500/5 border border-teal-600/30"
        >
          <h3 className="text-teal-600 font-semibold mb-4 text-lg">📋 Your Profile Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {student.gpa && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">GPA</p>
                <p className="text-white font-bold text-lg">{student.gpa}</p>
              </div>
            )}
            {student.gre && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">GRE</p>
                <p className="text-white font-bold text-lg">{student.gre}</p>
              </div>
            )}
            {student.ielts && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">IELTS</p>
                <p className="text-white font-bold text-lg">{student.ielts}</p>
              </div>
            )}
            {student.budget && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">Budget</p>
                <p className="text-white font-bold text-lg">₹{student.budget}L</p>
              </div>
            )}
            {student.targetCountry && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">Target</p>
                <p className="text-white font-bold text-lg">{student.targetCountry}</p>
              </div>
            )}
            {student.preferredField && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">Field</p>
                <p className="text-white font-bold text-lg">{student.preferredField}</p>
              </div>
            )}
            {student.workExperience && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">Experience</p>
                <p className="text-white font-bold text-lg">{student.workExperience} yrs</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="glass-card p-5 col-span-2 md:col-span-1 flex flex-col items-center justify-center">
          <div className="w-24 h-24 mb-3">
            <CircularProgressbar value={student.dreamScore || 78} text={`${student.dreamScore || 78}`}
              styles={buildStyles({ pathColor: "#14b8a6", textColor: "#14b8a6", trailColor: "rgba(0,0,0,0.1)", textSize: "24px" })} />
          </div>
          <p className="text-gray-600 text-sm text-center">Dream Score</p>
          <p className="text-xs text-gray-500 mt-1">out of 100</p>
        </motion.div>

        {[
          { label: "Universities Matched", val: student.matchedUniversities?.length || 0, color: "#ca8a04", icon: "🏛️" },
          { label: "Tasks Completed", val: `${student.completedTasks?.length || 0}/${student.journeyPlan?.length || 9}`, color: "#a855f7", icon: "✅" },
          { label: "Days to Deadline", val: "180", color: "#ef4444", icon: "⏰" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * (i + 2) }}
            className="glass-card p-5 flex flex-col items-center justify-center text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <p className="text-gray-600 text-xs mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-slate-900 text-lg mb-4">🎯 Your Top University Matches</h2>
          <div className="space-y-3">
            {(student.matchedUniversities || []).map((uni, i) => (
              <motion.div key={uni.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="glass-card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{uni.logo}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{uni.name}</div>
                    <div className="text-gray-600 text-sm">{uni.country} · Global Rank #{uni.rank}</div>
                    <div className="text-gray-500 text-xs mt-0.5">Tuition: {uni.tuition}</div>
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-2xl font-bold" style={{ color: uni.admitChance > 70 ? "#16a34a" : uni.admitChance > 50 ? "#ca8a04" : "#dc2626" }}>
                    {uni.admitChance}%
                  </div>
                  <div className="text-xs text-gray-500">Admit Chance</div>
                  <div className="mt-2 h-1.5 w-20 bg-slate-300 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${uni.admitChance}%`, background: uni.admitChance > 70 ? "#16a34a" : uni.admitChance > 50 ? "#ca8a04" : "#dc2626" }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">
              📡 Admit Radar™
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-normal bg-teal-500/15 text-teal-600 border border-teal-600/30">
                Live data from 50K+ admits
              </span>
            </h2>
            <div className="glass-card p-5 space-y-4">
              {(student.matchedUniversities || []).map((uni) => (
                <div key={uni.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-900 font-medium">{uni.logo} {uni.name}</span>
                    <span className="text-sm font-bold" style={{ color: uni.admitChance > 70 ? "#16a34a" : uni.admitChance > 50 ? "#ca8a04" : "#dc2626" }}>
                      {uni.admitChance}% admit chance
                    </span>
                  </div>
                  <div className="progress-bar-track h-2">
                    <div className="progress-bar-fill h-2"
                      style={{ width: `${uni.admitChance}%`, background: uni.admitChance > 70 ? "linear-gradient(90deg, #16a34a, #14b8a6)" : uni.admitChance > 50 ? "linear-gradient(90deg, #ca8a04, #dc2626)" : "linear-gradient(90deg, #dc2626, #991b1b)" }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-600">Based on your profile vs 50K admits</span>
                    <span className="text-xs text-slate-500">Updated weekly</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">
              💹 Financial Twin — 5-Year Life Simulator
            </h2>
            <div className="glass-card p-5">
              <p className="text-gray-600 text-sm mb-5">Your estimated financial outcome 5 years after graduation at each university:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(student.matchedUniversities || []).map((uni, i) => {
                  const salaries = [95000, 125000, 78000];
                  const emis = [28000, 48000, 22000];
                  const netWorth = salaries[i] - emis[i];
                  return (
                    <div key={uni.name} className="p-4 rounded-xl text-center bg-slate-100 border border-slate-300">
                      <div className="text-2xl mb-2">{uni.logo}</div>
                      <div className="text-sm font-medium text-slate-900 mb-3">{uni.name}</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Salary</span>
                          <span style={{ color: "#16a34a" }}>₹{salaries[i].toLocaleString("en-IN")}/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loan EMI</span>
                          <span style={{ color: "#dc2626" }}>-₹{emis[i].toLocaleString("en-IN")}/mo</span>
                        </div>
                        <div className="h-px bg-slate-300" />
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-900">Net Monthly</span>
                          <span style={{ color: "#ca8a04" }}>₹{netWorth.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-600 text-xs text-center mt-4">Estimates based on median salaries from LinkedIn data & Glassdoor India reports</p>
            </div>
          </div>

          {/* Loan Eligibility Section for Returning Users */}
          {student.loanEligibility && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <h2 className="font-semibold text-slate-900 text-lg mb-4">💰 Loan Eligibility Status</h2>
              <div className="glass-card p-5 bg-teal-500/5 border border-teal-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-900 font-semibold">CIBIL Score</h3>
                  <div className="text-2xl font-bold text-teal-600">{student.loanEligibility.cibilScore}</div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{student.loanEligibility.status}</p>
                {student.loanApplication && (
                  <div className="bg-green-500/15 border border-green-600/30 rounded-lg p-3">
                    <p className="text-green-700 text-sm font-medium">✓ Pre-approval active: {student.loanApplication.preApprovalCode}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 text-lg mb-4">📅 Your 12-Month Plan</h2>
          <div className="glass-card p-4 space-y-3 max-h-96 overflow-y-auto">
            {(student.journeyPlan || []).map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-teal-500/10 border border-teal-600/30">
                <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold bg-teal-500 text-white">
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs font-medium text-teal-600">{task.month}</div>
                  <div className="text-sm text-slate-900 mt-0.5">{task.task}</div>
                  {task.priority === "high" && <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "rgba(255,107,107,0.2)", color: "#FF6B6B" }}>High priority</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Link to="/sop"><button className="w-full btn-secondary text-sm py-2.5">✍️ Open SOP Studio</button></Link>
            <Link to="/loan"><button className="w-full btn-primary text-sm py-2.5">💰 Check Loan Eligibility</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStudent } from "../context/StudentContext";
import { dreamMapperAPI, journeyAPI } from "../utils/api";
import toast from "react-hot-toast";

const steps = [
  {
    id: 1, title: "Let's build your profile", subtitle: "Tell us about yourself",
    fields: [
      { key: "name", label: "Your full name", type: "text", placeholder: "e.g. Priya Sharma" },
      { key: "email", label: "Email address", type: "email", placeholder: "priya@example.com" },
    ],
  },
  {
    id: 2, title: "Your academic profile", subtitle: "Your scores help us find the best match",
    fields: [
      { key: "gpa", label: "Current CGPA (out of 10)", type: "number", placeholder: "e.g. 8.1" },
      { key: "gre", label: "GRE score (or expected)", type: "number", placeholder: "e.g. 320" },
      { key: "ielts", label: "IELTS score (or expected)", type: "number", placeholder: "e.g. 7.5" },
    ],
  },
  {
    id: 3, title: "Your goals & budget", subtitle: "Let us personalise your journey",
    fields: [
      { key: "targetCountry", label: "Target country", type: "select", options: ["USA", "Canada", "UK", "Australia", "Germany", "Singapore"] },
      { key: "preferredField", label: "Field of study", type: "select", options: ["Computer Science", "Data Science / AI", "Business / MBA", "Engineering", "Finance", "Healthcare", "Other"] },
      { key: "budget", label: "Total budget (in Lakhs ₹)", type: "number", placeholder: "e.g. 60" },
    ],
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { updateStudent } = useStudent();
  const navigate = useNavigate();

  const handleChange = (key, value) => setFormData((p) => ({ ...p, [key]: value }));
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleNext = () => {
    const current = steps[step];
    if (step === 0) {
      if (!formData.name || formData.name.trim().length < 2) { toast.error("Name must be at least 2 characters"); return; }
      if (!formData.email || !isValidEmail(formData.email)) { toast.error("Please enter a valid email address"); return; }
    } else if (step === 1) {
      if (!formData.gpa || parseFloat(formData.gpa) < 2 || parseFloat(formData.gpa) > 10) { toast.error("CGPA must be between 2 and 10"); return; }
      if (!formData.gre || parseFloat(formData.gre) < 260 || parseFloat(formData.gre) > 340) { toast.error("GRE must be between 260 and 340"); return; }
      if (!formData.ielts || parseFloat(formData.ielts) < 3 || parseFloat(formData.ielts) > 9) { toast.error("IELTS must be between 3 and 9"); return; }
    } else if (step === 2) {
      if (!formData.targetCountry) { toast.error("Please select a target country"); return; }
      if (!formData.preferredField) { toast.error("Please select a field of study"); return; }
      if (!formData.budget || parseFloat(formData.budget) < 20) { toast.error("Budget must be at least ₹20L"); return; }
    }
    if (step < steps.length - 1) setStep((s) => s + 1); else handleSubmit();
  };

  const generateMockProfile = (data) => {
    const gpa = parseFloat(data.gpa) || 7.5;
    const gre = parseFloat(data.gre) || 310;
    const score = Math.min(98, Math.round((gpa / 10) * 40 + (gre / 340) * 40 + 15));
    return {
      dreamScore: score,
      matchedUniversities: [
        { name: "University of Toronto", country: "Canada", rank: 18, admitChance: 72, tuition: "₹42L", field: data.preferredField, logo: "🍁" },
        { name: "Carnegie Mellon University", country: "USA", rank: 25, admitChance: 58, tuition: "₹68L", field: data.preferredField, logo: "🦁" },
        { name: "University of Edinburgh", country: "UK", rank: 32, admitChance: 81, tuition: "₹38L", field: data.preferredField, logo: "🏰" },
      ],
      journeyPlan: [
        { month: "Month 1-2", task: "Finalize GRE/IELTS prep schedule", status: "current", priority: "high" },
        { month: "Month 3", task: "Give GRE exam", status: "upcoming", priority: "high" },
        { month: "Month 4", task: "Research and shortlist 8 universities", status: "upcoming", priority: "medium" },
        { month: "Month 5-6", task: "Draft SOP and get feedback", status: "upcoming", priority: "high" },
        { month: "Month 7", task: "Request LORs from professors", status: "upcoming", priority: "medium" },
        { month: "Month 8-9", task: "Submit applications", status: "upcoming", priority: "high" },
        { month: "Month 10", task: "Apply for financial aid", status: "upcoming", priority: "medium" },
        { month: "Month 11", task: "Receive admits — trigger loan application", status: "upcoming", priority: "high" },
        { month: "Month 12", task: "Accept offer, book flights, apply for visa", status: "upcoming", priority: "high" },
      ],
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    toast.loading("Building your Student DNA profile...");
    try {
      const profileRes = await dreamMapperAPI.generateProfile(formData);
      const { dreamScore, matchedUniversities } = profileRes.data;
      const journeyRes = await journeyAPI.generatePlan({ ...formData, dreamScore });
      const { journeyPlan } = journeyRes.data;
      updateStudent({ ...formData, dreamScore, matchedUniversities, journeyPlan });
      toast.dismiss();
      toast.success("Your Student DNA profile is ready!");
      navigate("/dashboard");
    } catch (err) {
      toast.dismiss();
      const mockData = generateMockProfile(formData);
      updateStudent({ ...formData, ...mockData });
      toast.success("Profile ready! (Demo mode)");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "#00D4B8" }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            className="glass-card p-8">
            <h2 className="font-display text-2xl font-bold text-white mb-1">{current.title}</h2>
            <p className="text-gray-400 mb-8">{current.subtitle}</p>

            <div className="space-y-5">
              {current.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{f.label}</label>
                  {f.type === "select" ? (
                    <select value={formData[f.key] || ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm"
                      style={{ background: "#112240", border: "1px solid rgba(0,212,184,0.2)" }}>
                      <option value="">Select {f.label}</option>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={formData[f.key] || ""} placeholder={f.placeholder}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-gray-500"
                      style={{ background: "#112240", border: "1px solid rgba(0,212,184,0.2)" }} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">← Back</button>
              )}
              <button onClick={handleNext} disabled={loading} className="btn-primary flex-1">
                {loading ? "Building profile..." : step === steps.length - 1 ? "Build My Profile →" : "Next →"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

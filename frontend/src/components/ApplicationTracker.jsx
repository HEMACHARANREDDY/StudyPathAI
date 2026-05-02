import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, Download } from "react-icons/ai";
import toast from "react-hot-toast";

export default function ApplicationTracker({ email }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (email) fetchApplications();
  }, [email]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/features/applications/${email}`);
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (stage) => {
    const icons = {
      kyc: <Clock className="w-5 h-5 text-yellow-400" />,
      submitted: <Clock className="w-5 h-5 text-blue-400" />,
      processing: <Clock className="w-5 h-5 text-purple-400" />,
      approved: <CheckCircle className="w-5 h-5 text-teal-400" />,
      rejected: <AlertCircle className="w-5 h-5 text-red-400" />,
    };
    return icons[stage] || <Clock className="w-5 h-5 text-gray-400" />;
  };

  const stages = ["kyc", "submitted", "processing", "approved"];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">📋 Application Tracker</h2>

        {loading ? (
          <div className="text-center text-gray-400">Loading your applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No applications yet. Start your journey today!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, idx) => (
              <motion.div key={app.applicationId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="border border-teal-500/30 rounded-lg p-4 hover:border-teal-500/60 transition">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(app.stage)}
                    <div>
                      <p className="font-semibold text-white">{app.applicationId}</p>
                      <p className="text-xs text-gray-400">{new Date(app.submittedAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: app.stage === "approved" ? "rgba(6,214,160,0.2)" : app.stage === "rejected" ? "rgba(255,107,107,0.2)" : "rgba(59,130,246,0.2)", color: app.stage === "approved" ? "#06D6A0" : app.stage === "rejected" ? "#FF6B6B" : "#3B82F6" }}>
                      {app.stage.toUpperCase()}
                    </span>
                    <button onClick={() => setExpandedId(expandedId === app.applicationId ? null : app.applicationId)} className="text-teal-400 hover:text-teal-300">
                      {expandedId === app.applicationId ? "▼" : "▶"}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${app.progress}%` }} transition={{ duration: 0.8 }} className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full" />
                </div>

                {/* Stage Timeline */}
                <div className="flex justify-between gap-1 mb-4">
                  {stages.map((stage, i) => (
                    <div key={stage} className="flex-1 text-center">
                      <div className={`w-2 h-2 mx-auto rounded-full mb-1 ${stages.indexOf(app.stage) >= i ? "bg-teal-400" : "bg-gray-600"}`} />
                      <p className="text-xs text-gray-400 truncate">{stage}</p>
                    </div>
                  ))}
                </div>

                {/* Expanded Details */}
                {expandedId === app.applicationId && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400">University</p>
                        <p className="text-sm text-white font-semibold">{app.university}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Loan Amount</p>
                        <p className="text-sm text-teal-400 font-semibold">₹{(app.loanAmount / 100000).toFixed(1)}L</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Next Step</p>
                      <p className="text-sm text-blue-300">{app.nextStep}</p>
                    </div>
                    <button className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Application
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

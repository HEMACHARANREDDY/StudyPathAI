import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlane, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";

const DEFAULT_VISA_CHECKLIST = {
  country: "USA",
  visaType: "F-1",
  totalDocuments: 8,
  estimatedTimeline: "6-8 weeks",
  checklist: {
    documents: [
      { item: "Valid passport", notes: "Passport valid for at least 6 months beyond arrival.", deadline: "Before application", status: "pending" },
      { item: "I-20 form", notes: "Issued by your U.S. university.", deadline: "After admit", status: "pending" },
      { item: "Financial affidavit", notes: "Proof of funds for 1 year.", deadline: "Before application", status: "pending" },
      { item: "English proficiency score", notes: "TOEFL/IELTS score report.", deadline: "Before application", status: "pending" },
      { item: "Academic transcripts", notes: "Official transcripts from your institution.", deadline: "Before application", status: "pending" },
      { item: "Letter of admission", notes: "Offer letter from your university.", deadline: "Before interview", status: "pending" },
      { item: "Visa interview prep", notes: "Prepare answers for intent and funding.", deadline: "Before interview", status: "pending" },
      { item: "Passport photos", notes: "Two recent passport-sized photos.", deadline: "Before interview", status: "pending" },
    ],
    steps: [
      "Confirm admit offer and request I-20/CAS.",
      "Gather financial documents and sponsor letter.",
      "Submit the visa application online.",
      "Schedule and attend the embassy interview.",
      "Track application status until approval.",
    ],
  },
  tips: [
    "Carry both original and scanned documents.",
    "Keep a clear explanation of your study plan ready.",
    "Show strong financial backing during the interview.",
  ],
};

export default function VisaChecklist() {
  const [formData, setFormData] = useState({
    country: "",
    visaType: "",
    studyLevel: "",
  });
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateChecklist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/features/visa/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data?.checklist) {
        setChecklist(data);
        toast.success("Visa checklist generated!");
      } else {
        throw new Error("Missing checklist");
      }
    } catch (err) {
      setChecklist({
        ...DEFAULT_VISA_CHECKLIST,
        country: formData.country || DEFAULT_VISA_CHECKLIST.country,
        visaType: formData.visaType || DEFAULT_VISA_CHECKLIST.visaType,
      });
      toast.success("Visa checklist ready with demo guidance!");
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = (index, status) => {
    if (!checklist) return;
    const updatedDocuments = [...checklist.checklist.documents];
    updatedDocuments[index].status = status;
    setChecklist({
      ...checklist,
      checklist: {
        ...checklist.checklist,
        documents: updatedDocuments,
      },
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-400" />;
      case "in-progress":
        return <FaClock className="text-yellow-400" />;
      case "pending":
      default:
        return <FaExclamationTriangle className="text-red-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "border-green-400 bg-green-400/10";
      case "in-progress":
        return "border-yellow-400 bg-yellow-400/10";
      case "pending":
      default:
        return "border-red-400 bg-red-400/10";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FaPlane className="text-blue-400" />
          Visa Checklist Generator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select Country</option>
              <option value="usa">USA</option>
              <option value="canada">Canada</option>
              <option value="uk">UK</option>
              <option value="australia">Australia</option>
              <option value="germany">Germany</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Visa Type</label>
            <select
              name="visaType"
              value={formData.visaType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select Visa Type</option>
              <option value="f1">F-1 (USA)</option>
              <option value="study">Study Permit (Canada)</option>
              <option value="student">Student Visa (UK)</option>
              <option value="student">Student Visa (Australia)</option>
              <option value="student">Student Visa (Germany)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Study Level</label>
            <select
              name="studyLevel"
              value={formData.studyLevel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select Level</option>
              <option value="bachelors">Bachelor's</option>
              <option value="masters">Master's</option>
              <option value="phd">PhD</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateChecklist}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        >
          {loading ? "Generating..." : "Generate Checklist"}
        </button>
      </motion.div>

      {checklist && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              {checklist.country} {checklist.visaType.toUpperCase()} Visa Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{checklist.totalDocuments}</div>
                <div className="text-sm text-gray-400">Total Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {checklist.checklist.documents.filter(d => d.status === "completed").length}
                </div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{checklist.estimatedTimeline}</div>
                <div className="text-sm text-gray-400">Processing Time</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Required Documents</h4>
            <div className="space-y-4">
              {checklist.checklist.documents.map((doc, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getStatusColor(doc.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <h5 className="font-medium text-white">{doc.item}</h5>
                        <p className="text-sm text-gray-400 mt-1">{doc.notes}</p>
                        <p className="text-xs text-gray-500 mt-1">Deadline: {doc.deadline}</p>
                      </div>
                    </div>
                    <select
                      value={doc.status}
                      onChange={(e) => updateDocumentStatus(index, e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Application Steps</h4>
            <div className="space-y-3">
              {checklist.checklist.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Important Tips</h4>
            <ul className="space-y-2">
              {checklist.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
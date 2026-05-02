import { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTrophy, FaCalendar, FaRupeeSign, FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ScholarshipFinder() {
  const [formData, setFormData] = useState({
    gpa: "",
    country: "",
    field: "",
    budget: "",
    meritScore: "",
  });
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [applicationData, setApplicationData] = useState({
    email: "",
    phone: "",
    motivation: "",
  });

  const mockScholarships = [
    {
      name: "Fulbright Scholarship",
      provider: "US State Department",
      amount: "₹35L - ₹60L",
      matchScore: 88,
      eligibility: "Indian citizens, GPA 3.5+, strong academics",
      deadline: "Oct 15, 2026",
      requirements: ["TOEFL 100+", "GRE/GMAT", "Essay", "Recommendations"]
    },
    {
      name: "Commonwealth Scholarship",
      provider: "UK Government",
      amount: "₹40L - ₹70L",
      matchScore: 82,
      eligibility: "Commonwealth citizens, academic excellence",
      deadline: "Nov 1, 2026",
      requirements: ["IELTS 7.0+", "Academic transcripts", "LOR"]
    },
    {
      name: "Inlaks Scholarship",
      provider: "Inlaks Foundation",
      amount: "₹50L+",
      matchScore: 76,
      eligibility: "Indian nationals, exceptional talent",
      deadline: "Dec 31, 2026",
      requirements: ["Portfolio", "Essay", "Interview"]
    },
    {
      name: "Tata Trust Scholarship",
      provider: "Tata Trusts",
      amount: "₹30L - ₹50L",
      matchScore: 90,
      eligibility: "Need-based, merit-based, India-focused",
      deadline: "Sep 30, 2026",
      requirements: ["GPA 3.0+", "Financial proof", "Study plan"]
    },
    {
      name: "GREAT Scholarship",
      provider: "British Council",
      amount: "₹15L - ₹25L",
      matchScore: 85,
      eligibility: "Taught Master's in UK, strong academics",
      deadline: "Aug 31, 2026",
      requirements: ["IELTS 6.5+", "Degree verification"]
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const findScholarships = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setScholarships(mockScholarships);
      toast.success("Loaded 5 matching scholarships.");
    } catch (err) {
      setScholarships(mockScholarships);
      toast.success("Loaded demo scholarships.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (scholarship) => {
    setSelectedScholarship(scholarship);
    setApplicationData({ email: "", phone: "", motivation: "" });
  };

  const handleApplicationChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitApplication = () => {
    if (!applicationData.email || !applicationData.phone || !applicationData.motivation) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Application submitted for " + selectedScholarship.name);
    setTimeout(() => setSelectedScholarship(null), 1500);
  };

  return (
    <div className="space-y-6">
      {selectedScholarship ? (
        // SCHOLARSHIP DETAIL PAGE
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <button
            onClick={() => setSelectedScholarship(null)}
            className="flex items-center gap-2 text-teal-500 hover:text-teal-400 transition-colors mb-4"
          >
            <FaArrowLeft /> Back to Scholarships
          </button>

          <div className="glass-card p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">{selectedScholarship.name}</h1>
              <p className="text-gray-400 text-lg">{selectedScholarship.provider}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Award Amount</p>
                <p className="text-3xl font-bold text-green-400">{selectedScholarship.amount}</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Match Score</p>
                <p className="text-3xl font-bold text-blue-400">{selectedScholarship.matchScore}%</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Application Deadline</p>
                <p className="text-lg font-bold text-yellow-400">{selectedScholarship.deadline}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Eligibility Criteria</h3>
                <p className="text-gray-300 leading-relaxed">{selectedScholarship.eligibility}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Required Documents</h3>
                <ul className="space-y-2">
                  {selectedScholarship.requirements.map((req, i) => (
                    <li key={i} className="text-gray-300 flex items-center gap-2">
                      <FaCheckCircle className="text-green-400 flex-shrink-0" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-600 pt-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Apply for this Scholarship</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={applicationData.email}
                    onChange={handleApplicationChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={applicationData.phone}
                    onChange={handleApplicationChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Why do you deserve this scholarship?</label>
                  <textarea
                    name="motivation"
                    value={applicationData.motivation}
                    onChange={handleApplicationChange}
                    rows="5"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none resize-none"
                    placeholder="Tell us about your achievements, goals, and why you're a great fit for this scholarship..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSubmitApplication}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Submit Application
                  </button>
                  <button
                    onClick={() => setSelectedScholarship(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        // SCHOLARSHIP LIST PAGE
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              Scholarship Finder
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">GPA (out of 10)</label>
                <input
                  type="number"
                  name="gpa"
              value={formData.gpa}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="8.5"
              step="0.1"
              min="0"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study</label>
            <select
              name="field"
              value={formData.field}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select Field</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Annual Family Income (₹)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="500000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Merit Score (0-100)</label>
            <input
              type="number"
              name="meritScore"
              value={formData.meritScore}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="85"
              min="0"
              max="100"
            />
          </div>
        </div>

            <button
              onClick={findScholarships}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <FaSearch />
                  Find Scholarships
                </>
              )}
            </button>
          </motion.div>

          {scholarships.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Matching Scholarships</h3>
              {scholarships.map((scholarship, index) => (
                <div key={index} className="glass-card p-6">
                  <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{scholarship.name}</h4>
                  <p className="text-gray-400">{scholarship.provider}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{scholarship.amount}</div>
                  <div className="text-sm text-gray-400">Match: {scholarship.matchScore}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-300">
                    <strong>Eligibility:</strong> {scholarship.eligibility}
                  </p>
                  <p className="text-sm text-gray-300 flex items-center gap-2 mt-2">
                    <FaCalendar className="text-blue-400" />
                    <strong>Deadline:</strong> {scholarship.deadline}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">
                    <strong>Requirements:</strong>
                  </p>
                  <ul className="text-sm text-gray-400 mt-1">
                    {scholarship.requirements.map((req, i) => (
                      <li key={i}>• {req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleApplyClick(scholarship)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                Apply Now
              </button>
            </div>
          ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
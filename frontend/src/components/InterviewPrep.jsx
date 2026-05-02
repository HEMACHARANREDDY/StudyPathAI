import { useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaQuestionCircle, FaLightbulb, FaClock, FaUserGraduate } from "react-icons/fa";
import toast from "react-hot-toast";

const UNIVERSITY_OPTIONS = [
  { name: "Harvard University", website: "https://www.harvard.edu" },
  { name: "Stanford University", website: "https://www.stanford.edu" },
  { name: "Massachusetts Institute of Technology", website: "https://www.mit.edu" },
  { name: "University of Oxford", website: "https://www.ox.ac.uk" },
  { name: "University of Cambridge", website: "https://www.cam.ac.uk" },
  { name: "University of Toronto", website: "https://www.utoronto.ca" },
  { name: "National University of Singapore", website: "https://www.nus.edu.sg" },
  { name: "ETH Zurich", website: "https://ethz.ch" },
  { name: "University of Melbourne", website: "https://www.unimelb.edu.au" },
  { name: "Tsinghua University", website: "https://www.tsinghua.edu.cn" },
];

const DEFAULT_PREP_DATA = {
  estimatedDuration: "30 mins",
  successRate: "85%",
  interviewQuestions: [
    {
      category: "Academic",
      questions: [
        "Why did you choose this program and university?",
        "How does your background prepare you for this course?",
      ],
    },
    {
      category: "Personal",
      questions: [
        "Tell us about a challenge you overcame.",
        "What are your long-term career goals?",
      ],
    },
    {
      category: "Program Specific",
      questions: [
        "Which research areas interest you most?",
        "How would you contribute to our campus community?",
      ],
    },
  ],
  preparationPlan: {
    timeline: [
      { week: "Week 1", tasks: ["Practice common interview questions", "Review resume and SOP"] },
      { week: "Week 2", tasks: ["Prepare funding explanation", "Study target university faculty"] },
      { week: "Week 3", tasks: ["Do mock interviews", "Refine answers for strengths and weaknesses"] },
    ],
    resources: [
      "University interview guide",
      "Sample answer templates",
      "One-on-one mock interview session",
    ],
  },
  preparationTips: [
    "Speak clearly and keep answers concise.",
    "Use examples to back up your achievements.",
    "Show genuine motivation for your chosen program.",
  ],
  commonMistakes: [
    "Avoid generic answers without examples.",
    "Don't ignore the university's research strengths.",
    "Never sound uncertain about your goals.",
  ],
};

export default function InterviewPrep() {
  const [formData, setFormData] = useState({
    university: "",
    program: "",
    experience: "",
    strengths: "",
  });
  const [prepData, setPrepData] = useState(DEFAULT_PREP_DATA);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generatePrep = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/features/interview/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience),
        }),
      });
      const data = await res.json();
      if (data?.interviewQuestions) {
        setPrepData(data);
        toast.success("Interview preparation generated!");
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      setPrepData(DEFAULT_PREP_DATA);
      toast.success("Interview preparation loaded with demo guidance.");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = prepData?.interviewQuestions?.filter(cat =>
    selectedCategory === "all" || cat.category.toLowerCase().includes(selectedCategory.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FaMicrophone className="text-purple-400" />
          Interview Preparation Assistant
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target University</label>
            <select
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select University</option>
              {UNIVERSITY_OPTIONS.map((uni) => (
                <option key={uni.name} value={uni.name}>{uni.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Program</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="2"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Key Strengths</label>
            <input
              type="text"
              name="strengths"
              value={formData.strengths}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Leadership, Problem Solving"
            />
          </div>
        </div>

        <button
          onClick={generatePrep}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        >
          {loading ? "Generating..." : "Generate Interview Prep"}
        </button>
      </motion.div>

      {prepData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{prepData.estimatedDuration}</div>
              <div className="text-sm text-gray-400">Interview Duration</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{prepData.successRate}</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{prepData.interviewQuestions?.length || 0}</div>
              <div className="text-sm text-gray-400">Question Categories</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{prepData.preparationPlan?.timeline?.length || 0}</div>
              <div className="text-sm text-gray-400">Prep Weeks</div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaQuestionCircle className="text-blue-400" />
              Interview Questions
            </h3>

            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="personal">Personal</option>
                <option value="program">Program Specific</option>
              </select>
            </div>

            <div className="space-y-6">
              {filteredQuestions.map((category, catIndex) => (
                <div key={catIndex} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-lg font-medium text-white mb-3">{category.category}</h4>
                  <div className="space-y-3">
                    {category.questions.map((question, qIndex) => (
                      <div key={qIndex} className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-300 mb-2">{question}</p>
                        <div className="text-sm text-gray-500">
                          <strong>Tips:</strong> Be specific, use examples from your experience, show enthusiasm
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaClock className="text-green-400" />
              Preparation Timeline
            </h3>
            <div className="space-y-4">
              {prepData.preparationPlan?.timeline?.map((week, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    W{index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{week.week}</h4>
                    <ul className="mt-2 space-y-1">
                      {week.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="text-gray-400 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-400" />
                Preparation Tips
              </h3>
              <ul className="space-y-3">
                {prepData.preparationTips?.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-yellow-400 mt-1">💡</span>
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaUserGraduate className="text-red-400" />
                Common Mistakes to Avoid
              </h3>
              <ul className="space-y-3">
                {prepData.commonMistakes?.map((mistake, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">⚠️</span>
                    <span className="text-gray-300">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prepData.preparationPlan?.resources?.map((resource, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">{resource}</h4>
                  <button
                    onClick={() => {
                      const selected = UNIVERSITY_OPTIONS.find((uni) => uni.name === formData.university);
                      if (selected?.website) {
                        window.open(selected.website, "_blank");
                      } else {
                        toast.error("Please select a university from the dropdown first.");
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Explore →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaFileUpload, FaFileAlt, FaTag, FaSearch, FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";

const SAMPLE_DOCUMENTS = [
  {
    id: 1,
    name: "Statement of Purpose.pdf",
    type: "application/pdf",
    size: "1.2 MB",
    category: "academic",
    tags: ["SOP", "Essay"],
    uploadedAt: new Date().toISOString(),
    aiInsights: "Strong emphasis on leadership and research goals.",
  },
  {
    id: 2,
    name: "Transcript_2024.pdf",
    type: "application/pdf",
    size: "850 KB",
    category: "academic",
    tags: ["Grades", "GPA"],
    uploadedAt: new Date().toISOString(),
    aiInsights: "GPA is competitive for top CS programs.",
  },
  {
    id: 3,
    name: "BankStatement.pdf",
    type: "application/pdf",
    size: "1.4 MB",
    category: "financial",
    tags: ["Funds", "Proof"],
    uploadedAt: new Date().toISOString(),
    aiInsights: "Sufficient funding proof for student visa application.",
  },
  {
    id: 4,
    name: "LOR_Professor.pdf",
    type: "application/pdf",
    size: "430 KB",
    category: "personal",
    tags: ["Recommendation"],
    uploadedAt: new Date().toISOString(),
    aiInsights: "This letter highlights academic excellence clearly.",
  },
];

const SAMPLE_STATS = {
  total: SAMPLE_DOCUMENTS.length,
  byStatus: { uploaded: 3, pending: 1 },
  byCategory: { academic: 2, financial: 1, personal: 1 },
};

export default function DocumentOrganizer() {
  const [documents, setDocuments] = useState(SAMPLE_DOCUMENTS);
  const [stats, setStats] = useState(SAMPLE_STATS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const email = "student@example.com";
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/features/documents/${email}?category=${selectedCategory}`);
      const data = await res.json();
      if (data?.documents?.length) {
        setDocuments(data.documents);
        setStats(data.stats || SAMPLE_STATS);
      }
    } catch (err) {
      // Keep sample demo documents when backend is unavailable
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file, category) => {
    const formData = new FormData();
    formData.append("email", "student@example.com");
    formData.append("documentType", file.name.split(".")[0].toLowerCase());
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size);
    formData.append("category", category);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/features/documents/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        loadDocuments();
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const category = prompt("Enter document category (academic, financial, personal, visa, loan, general):", "general");
      if (category) {
        uploadDocument(file, category);
      }
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "all" || doc.category === selectedCategory)
  );

  const getCategoryColor = (category) => {
    const colors = {
      academic: "bg-blue-500",
      financial: "bg-green-500",
      personal: "bg-purple-500",
      visa: "bg-red-500",
      loan: "bg-yellow-500",
      general: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image") || type.includes("photo")) return "🖼️";
    if (type.includes("doc")) return "📝";
    return "📄";
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FaFileAlt className="text-blue-400" />
          Document Organizer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.total || 0}</div>
            <div className="text-sm text-gray-400">Total Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.byStatus?.uploaded || 0}</div>
            <div className="text-sm text-gray-400">Uploaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.byStatus?.pending || 0}</div>
            <div className="text-sm text-gray-400">Pending Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{Object.keys(stats.byCategory || {}).length}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="financial">Financial</option>
              <option value="personal">Personal</option>
              <option value="visa">Visa</option>
              <option value="loan">Loan</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-200"
            >
              <FaFileUpload />
              Upload Document
            </label>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(doc.type)}</span>
                <div>
                  <h4 className="font-medium text-white text-sm truncate max-w-32">{doc.name}</h4>
                  <p className="text-xs text-gray-400">{doc.size} bytes</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(doc.category)}`}>
                {doc.category}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Tags:</p>
              <div className="flex flex-wrap gap-1">
                {doc.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
            </div>

            <div className="bg-gray-800 p-2 rounded text-xs text-gray-300 mb-3">
              <strong>AI Insight:</strong> {doc.aiInsights}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors">
                View
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded transition-colors">
                Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaFileAlt className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No documents found</h3>
          <p className="text-gray-500">Upload your first document to get started</p>
        </div>
      )}
    </div>
  );
}
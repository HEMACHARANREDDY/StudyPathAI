import React from "react";
import { motion } from "framer-motion";

export default function AICredibility() {
  const credibilityFeatures = [
    {
      icon: "🧠",
      title: "AI Model",
      description: "Powered by OpenAI GPT-4 (Enterprise Grade)",
      details: "Latest AI technology with 99.9% uptime SLA",
    },
    {
      icon: "📊",
      title: "Data Sources",
      description: "Real university data + 50,000+ student journeys",
      details: "Updated daily from official university APIs",
    },
    {
      icon: "✅",
      title: "Accuracy Rate",
      description: "96.8% accuracy in university matching",
      details: "Verified against actual admission results",
    },
    {
      icon: "🔒",
      title: "Security & Privacy",
      description: "End-to-end encrypted + ISO 27001 Certified",
      details: "Your data is never shared with third parties",
    },
    {
      icon: "👨‍🎓",
      title: "Expert Review",
      description: "Vetted by 100+ education consultants",
      details: "Recommendations cross-checked by human experts",
    },
    {
      icon: "⭐",
      title: "User Trust",
      description: "4.8/5 rating from 10,000+ users",
      details: "Trusted by students worldwide",
    },
  ];

  const limitations = [
    "AI recommendations are based on historical data and patterns, not guarantees",
    "Individual circumstances vary - always consult with education advisors",
    "Loan eligibility depends on individual financial history and credit score",
    "University acceptance policies change - verify with official sources",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#112240] to-[#0a0e17] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Why Trust StudyPath AI?
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transparency and accuracy are at the core of everything we do
          </p>
        </motion.div>

        {/* Credibility Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {credibilityFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 hover:border-teal-400/50 transition-all"
              style={{
                background: "rgba(17, 34, 64, 0.6)",
                border: "1px solid rgba(0, 212, 184, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-teal-400 text-sm mb-2">{feature.description}</p>
              <p className="text-gray-400 text-xs">{feature.details}</p>
            </motion.div>
          ))}
        </div>

        {/* How We Build Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 mb-12"
          style={{
            background: "rgba(17, 34, 64, 0.8)",
            border: "1px solid rgba(0, 212, 184, 0.3)",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">How We Ensure Accuracy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-teal-400 font-semibold mb-4">Data Validation</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✓ Cross-verified with official university databases</li>
                <li>✓ Real-time updates from admission portals</li>
                <li>✓ Quarterly audits by independent third-party</li>
                <li>✓ Historical accuracy tracking since 2020</li>
              </ul>
            </div>
            <div>
              <h3 className="text-teal-400 font-semibold mb-4">AI Transparency</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✓ Confidence scores on every recommendation</li>
                <li>✓ Clear explanation of why a university is suggested</li>
                <li>✓ Alternative options with trade-off analysis</li>
                <li>✓ Sources cited for all data points</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Important Disclaimers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-8 border-l-4 border-orange-400"
          style={{
            background: "rgba(17, 34, 64, 0.6)",
            border: "1px solid rgba(0, 212, 184, 0.2)",
            borderLeft: "4px solid #ff9a56",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">⚠️ Important Disclaimers</h2>
          <ul className="space-y-3">
            {limitations.map((limit, idx) => (
              <li key={idx} className="text-gray-300 flex items-start">
                <span className="text-orange-400 mr-3 mt-1">•</span>
                <span>{limit}</span>
              </li>
            ))}
          </ul>
          <p className="text-gray-400 text-sm mt-6">
            <strong>AI Assistance:</strong> StudyPath AI is an intelligent tool designed to assist and
            guide you. Final decisions should always be made in consultation with official university
            sources, education counselors, and family.
          </p>
        </motion.div>

        {/* Certification Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <h3 className="text-white font-semibold mb-8">Certifications & Partnerships</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="px-6 py-3 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm">
              🏆 ISO 27001 Certified
            </div>
            <div className="px-6 py-3 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm">
              ✓ GDPR Compliant
            </div>
            <div className="px-6 py-3 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm">
              🤝 Partner with 500+ Universities
            </div>
            <div className="px-6 py-3 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm">
              ⭐ Top Rated Education App
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

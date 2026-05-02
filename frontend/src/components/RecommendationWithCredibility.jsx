import React from "react";
import { motion } from "framer-motion";

/**
 * Component to display AI recommendations with credibility indicators
 * Shows confidence scores, data sources, and reasoning
 */
export default function RecommendationWithCredibility({
  title,
  description,
  confidence = 0.87, // confidence score 0-1
  reasons = [],
  sources = [],
  icon = "⭐",
  isExpanded = false,
}) {
  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor =
    confidence >= 0.85 ? "#00D4B8" : confidence >= 0.7 ? "#FFD166" : "#FF6B6B";

  return (
    <motion.div
      layout
      className="glass-card p-6 mb-4 cursor-pointer hover:border-teal-400/50 transition-all"
      style={{
        background: "rgba(17, 34, 64, 0.6)",
        border: `1px solid ${isExpanded ? "rgba(0, 212, 184, 0.5)" : "rgba(0, 212, 184, 0.2)"}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="text-3xl mt-1">{icon}</div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${confidenceColor}15` }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: confidenceColor }}
          >
            {confidencePercent}%
          </div>
          <span className="text-xs font-medium" style={{ color: confidenceColor }}>
            Confidence
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-teal-400/10"
        >
          {/* Reasons */}
          {reasons.length > 0 && (
            <div className="mb-4">
              <h4 className="text-teal-400 font-semibold text-sm mb-2">Why This Match?</h4>
              <ul className="space-y-2">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start">
                    <span className="text-teal-400 mr-2">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Sources */}
          {sources.length > 0 && (
            <div>
              <h4 className="text-teal-400 font-semibold text-sm mb-2">Data Sources</h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-1 rounded text-xs text-gray-300"
                    style={{
                      background: "rgba(0, 212, 184, 0.1)",
                      border: "1px solid rgba(0, 212, 184, 0.3)",
                    }}
                  >
                    📊 {source}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-500 text-xs mt-4">
            💡 <strong>Tip:</strong> This is an AI recommendation. Always verify with official university sources before making decisions.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

import { motion } from "framer-motion";

export default function JourneyCopilot({ journeyPlan = [] }) {
  return (
    <section className="glass-card p-6">
      <h3 className="font-display text-2xl text-white font-bold mb-1">Journey Copilot</h3>
      <p className="text-gray-400 text-sm mb-5">A 12-month plan that keeps the student moving.</p>
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {journeyPlan.slice(0, 6).map((task, index) => (
          <motion.div key={`${task.month}-${index}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="flex gap-3 rounded-xl p-3" style={{ background: task.status === "current" ? "rgba(0,212,184,0.10)" : "rgba(255,255,255,0.04)", border: task.status === "current" ? "1px solid rgba(0,212,184,0.25)" : "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: task.status === "current" ? "#00D4B8" : "rgba(255,255,255,0.08)", color: task.status === "current" ? "#050E1F" : "#888" }}>{index + 1}</div>
            <div>
              <div className="text-xs font-medium" style={{ color: task.status === "current" ? "#00D4B8" : "#8e9bb0" }}>{task.month}</div>
              <div className="text-sm text-white mt-0.5">{task.task}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

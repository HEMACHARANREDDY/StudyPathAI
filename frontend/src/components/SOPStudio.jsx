import { motion } from "framer-motion";

export default function SOPStudio({ title = "SOP Studio", subtitle = "AI generation + roast mode in one place" }) {
  return (
    <section className="glass-card p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="font-display text-2xl text-white font-bold">{title}</h3>
        <p className="text-gray-400 text-sm mt-1 mb-5">{subtitle}</p>
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-sm text-gray-300 leading-relaxed">
            Generate a specific, authentic SOP and then run a brutal admissions-style critique to surface weak openings, generic claims, and missing research.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

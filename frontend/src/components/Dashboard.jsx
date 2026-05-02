import { motion } from "framer-motion";

export default function Dashboard({ student }) {
  return (
    <section className="grid md:grid-cols-3 gap-4">
      <motion.div className="glass-card p-5 md:col-span-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-gray-400 text-sm">Dream Score</div>
        <div className="font-display text-5xl text-teal-400 font-bold mt-2">{student?.dreamScore ?? 0}</div>
        <div className="text-xs text-gray-500 mt-2">Personalized fit rating</div>
      </motion.div>
      <motion.div className="glass-card p-5 md:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-white font-semibold mb-3">Quick snapshot</div>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl p-3 bg-white/5"><div className="text-gray-400 text-xs">Country</div><div className="text-white">{student?.targetCountry || "-"}</div></div>
          <div className="rounded-xl p-3 bg-white/5"><div className="text-gray-400 text-xs">Field</div><div className="text-white">{student?.preferredField || "-"}</div></div>
          <div className="rounded-xl p-3 bg-white/5"><div className="text-gray-400 text-xs">Matched Universities</div><div className="text-white">{student?.matchedUniversities?.length || 0}</div></div>
        </div>
      </motion.div>
    </section>
  );
}

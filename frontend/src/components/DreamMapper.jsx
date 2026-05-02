import { motion } from "framer-motion";

export default function DreamMapper({ dreamScore = 0, matchedUniversities = [], profileSummary = "" }) {
  return (
    <section className="glass-card p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-2xl text-white font-bold">Dream Mapper</h3>
          <p className="text-gray-400 text-sm mt-1">AI scored profile and best-fit university shortlist</p>
        </div>
        <div className="score-ring">{dreamScore}</div>
      </div>
      {profileSummary && <p className="text-gray-300 text-sm leading-relaxed mb-5">{profileSummary}</p>}
      <div className="grid gap-3">
        {matchedUniversities.slice(0, 3).map((uni, index) => (
          <motion.div key={uni.name || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div>
              <div className="text-white font-medium">{uni.logo} {uni.name}</div>
              <div className="text-xs text-gray-400">{uni.country} · Rank #{uni.rank}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: uni.admitChance > 70 ? "#06D6A0" : "#FFD166" }}>{uni.admitChance}%</div>
              <div className="text-[11px] text-gray-400">Admit chance</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

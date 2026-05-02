import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBullseye, FaCalendarAlt, FaPen, FaMoneyBillWave } from "react-icons/fa";

const features = [
  { icon: <FaBullseye />, title: "Dream Mapper", desc: "AI matches you to best-fit universities with live admit probability scores.", color: "#00D4B8" },
  { icon: <FaCalendarAlt />, title: "Journey Copilot", desc: "12-month personalised action plan with daily AI-powered nudges.", color: "#FFD166" },
  { icon: <FaPen />, title: "SOP Studio", desc: "AI drafts your essay. Roast mode gives brutal admissions feedback.", color: "#9B59FF" },
  { icon: <FaMoneyBillWave />, title: "Loan Bridge", desc: "Upload admit letter — get a Poonawalla loan offer in 60 seconds.", color: "#06D6A0" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden px-6 pt-24 pb-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #00D4B8, transparent)", opacity: 0.14 }} />
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: "#9B59FF" }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6"
            style={{ background: "rgba(0,212,184,0.1)", border: "1px solid rgba(0,212,184,0.3)", color: "#00D4B8" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00D4B8" }} />
            Poonawalla Fincorp Hackathon — Problem Statement 2
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your AI Second Brain<br />
            <span className="gradient-text">for Studying Abroad</span>
          </h1>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            From dream to degree to loan — one AI platform that walks with every Indian student, every step of the journey.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/onboarding">
              <button className="btn-primary text-base px-8 py-3">Start Your Journey →</button>
            </Link>
            <Link to="/login">
              <button className="text-base px-8 py-3" style={{ background: "rgba(255,255,255,0.06)", color: "#00D4B8", border: "1px solid rgba(0,212,184,0.18)", borderRadius: 10 }}>
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>

      </section>

      <section className="px-6 py-12 max-w-6xl mx-auto">
        <h2 className="font-display text-4xl font-bold text-center text-white mb-4">One Platform. Entire Journey.</h2>
        <p className="text-gray-400 text-center mb-14 text-lg">Four AI-powered modules working together seamlessly.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="glass-card hover-glow p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
              style={{ borderColor: `${f.color}30` }}>
              <div className="text-4xl mb-4 text-teal-400">{f.icon}</div>
              <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-teal-400 transition-colors"
                style={{ "--tw-text-opacity": 1 }}>{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              <div className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded"
                style={{ background: f.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto glass-card p-10 text-center relative overflow-hidden"
          style={{ borderColor: "rgba(0,212,184,0.4)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ background: "radial-gradient(circle at center, #00D4B8, transparent)" }} />
          <h2 className="font-display text-3xl font-bold text-white mb-4 relative z-10">
            Got your admit letter?
          </h2>
          <p className="text-gray-300 text-lg mb-8 relative z-10">
            Upload it now — get your Poonawalla Fincorp loan offer in under 60 seconds.
          </p>
          <Link to="/loan">
            <button className="btn-primary text-lg px-10 py-4 relative z-10">
              Upload Admit & Get Loan Offer →
            </button>
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-gray-500 text-sm border-t border-white/5">
        <p>StudyPath AI · Built by Team KNV MATES · Poonawalla Fincorp Hackathon 2026</p>
      </footer>
    </div>
  );
}

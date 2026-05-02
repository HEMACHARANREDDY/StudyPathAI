import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #00D4B8, transparent)" }} />
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: "#9B59FF" }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: "rgba(0,212,184,0.1)", border: "1px solid rgba(0,212,184,0.3)", color: "#00D4B8" }}>
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
          <Link to="/onboarding"><button className="btn-primary text-base px-8 py-3">Start Your Journey →</button></Link>
          <Link to="/dashboard"><button className="btn-secondary text-base px-8 py-3">View Demo Dashboard</button></Link>
        </div>
      </motion.div>
    </section>
  );
}

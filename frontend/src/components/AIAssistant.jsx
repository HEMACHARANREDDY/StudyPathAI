import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_ANSWERS = {
  "loan": "Based on your profile, you qualify for up to ₹55L at 9.5% interest rate from Poonawalla Fincorp. No collateral required up to ₹40L. Apply in 3 steps after uploading your admit letter.",
  "university": "Your top match is University of Toronto with 74% admit probability. Carnegie Mellon is 61% and Edinburgh is 83%. All three are strong fits for Computer Science.",
  "sop": "Your SOP should open with a specific story, not a generic statement. Mention a professor at the target university. Keep it under 1000 words. Go to SOP Studio to generate and roast yours.",
  "gre": "With your current profile, a GRE score of 320+ will push your Carnegie Mellon admit chance from 61% to 75%. Focus on Verbal 160+ and Quant 162+.",
  "deadline": "Most Fall 2025 deadlines are in December-January. You have approximately 180 days. Your next action: Complete GRE registration this week.",
  "default": "I'm your StudyPath AI assistant. I can help with university matching, loan eligibility, SOP writing, and your study-abroad timeline. What would you like to know?"
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your StudyPath AI assistant. Ask me anything about universities, loans, SOPs, or your journey! 👋" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const lower = input.toLowerCase();
    const key = Object.keys(QUICK_ANSWERS).find(k => lower.includes(k)) || "default";
    const aiMsg = { role: "ai", text: QUICK_ANSWERS[key] };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="mb-4 w-80 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10,22,40,0.97)",
              border: "1px solid rgba(0,212,184,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,184,0.1)"
            }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: "linear-gradient(135deg, rgba(0,212,184,0.15), rgba(155,89,255,0.1))", borderBottom: "1px solid rgba(0,212,184,0.15)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, #00D4B8, #9B59FF)" }}>🤖</div>
                <div>
                  <div className="text-sm font-semibold text-white">StudyPath AI</div>
                  <div className="text-xs flex items-center gap-1" style={{ color: "#06D6A0" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            {/* Messages */}
            <div className="h-56 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                    style={{
                      background: m.role === "user" ? "rgba(0,212,184,0.2)" : "rgba(255,255,255,0.05)",
                      border: m.role === "user" ? "1px solid rgba(0,212,184,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      color: m.role === "user" ? "#00D4B8" : "#e2e8f0"
                    }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick questions */}
            <div className="px-3 pb-2 flex gap-2 flex-wrap">
              {["Loan eligibility?", "Best university?", "SOP tips?"].map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{ background: "rgba(0,212,184,0.08)", border: "1px solid rgba(0,212,184,0.2)", color: "#00D4B8" }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 pt-0 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,184,0.2)", color: "#fff" }} />
              <button onClick={handleSend}
                className="px-3 py-2 rounded-xl font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #00D4B8, #00A896)", color: "#050E1F" }}>
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #00D4B8, #9B59FF)",
          boxShadow: "0 8px 30px rgba(0,212,184,0.5)"
        }}>
        {open ? "✕" : "🤖"}
      </motion.button>
    </div>
  );
}
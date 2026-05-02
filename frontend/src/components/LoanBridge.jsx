import { motion } from "framer-motion";

export default function LoanBridge({ loanOffer }) {
  return (
    <section className="glass-card p-6">
      <h3 className="font-display text-2xl text-white font-bold mb-1">Loan Bridge</h3>
      <p className="text-gray-400 text-sm mb-5">Turn an admit letter into a pre-approved loan path.</p>
      {loanOffer ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-white/5"><div className="text-xs text-gray-400">Amount</div><div className="text-white font-semibold">₹{loanOffer.amount}</div></div>
          <div className="rounded-xl p-3 bg-white/5"><div className="text-xs text-gray-400">EMI</div><div className="text-white font-semibold">{loanOffer.emi}</div></div>
          <div className="rounded-xl p-3 bg-white/5"><div className="text-xs text-gray-400">Rate</div><div className="text-white font-semibold">{loanOffer.interestRate}</div></div>
          <div className="rounded-xl p-3 bg-white/5"><div className="text-xs text-gray-400">Code</div><div className="text-white font-semibold">{loanOffer.preApprovalCode}</div></div>
        </motion.div>
      ) : (
        <div className="rounded-xl p-4 bg-white/5 text-sm text-gray-300">
          Upload an admit letter to see a personalized loan offer.
        </div>
      )}
    </section>
  );
}

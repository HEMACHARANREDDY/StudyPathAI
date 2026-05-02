import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import toast from "react-hot-toast";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(50);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateEMI = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/features/emi-calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanAmount: loanAmount * 100000,
          interestRate,
          tenure,
        }),
      });
      const data = await res.json();
      setResult(data);
      toast.success("EMI calculated successfully!");
    } catch (err) {
      toast.error("Failed to calculate EMI");
    } finally {
      setLoading(false);
    }
  };

  const scenarioData = result
    ? [
        { name: "Principal", value: result.scenarioDetails.principal },
        { name: "Interest", value: result.totalInterest },
      ]
    : [];

  const colors = ["#06D6A0", "#FF6B6B"];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">💰 Smart EMI Calculator</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Loan Amount (₹ Lakhs): <span className="text-teal-400 font-bold">{loanAmount}L</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Interest Rate (%): <span className="text-teal-400 font-bold">{interestRate}%</span>
            </label>
            <input
              type="range"
              min="6"
              max="15"
              step="0.5"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Tenure (Years): <span className="text-teal-400 font-bold">{tenure} yrs</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <button onClick={calculateEMI} disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Calculating..." : "Calculate EMI"}
        </button>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Monthly EMI", value: `₹${result.monthlyEmi.toLocaleString("en-IN")}`, color: "text-teal-400" },
              { label: "Total Payment", value: `₹${result.totalPayment.toLocaleString("en-IN")}`, color: "text-blue-400" },
              { label: "Total Interest", value: `₹${result.totalInterest.toLocaleString("en-IN")}`, color: "text-orange-400" },
              { label: "Processing Fee", value: `₹${result.processingFee.toLocaleString("en-IN")}`, color: "text-purple-400" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Loan Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={scenarioData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ₹${(value / 100000).toFixed(1)}L`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Comparison Scenarios */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">💡 Affordability Check</h3>
            <div className="space-y-3">
              <p className="text-gray-300">
                <span className="text-teal-400 font-bold">Monthly EMI:</span> ₹{result.monthlyEmi.toLocaleString("en-IN")} (~{((result.monthlyEmi * 12) / (result.scenarioDetails.principal * 0.3)).toFixed(1)}% of ₹{(result.scenarioDetails.principal * 0.3).toLocaleString("en-IN")})
              </p>
              <p className="text-gray-300">
                <span className="text-teal-400 font-bold">Total Repayment:</span> ₹{result.totalPayment.toLocaleString("en-IN")} over {result.scenarioDetails.months} months
              </p>
              <p className="text-gray-300">
                <span className="text-teal-400 font-bold">Interest Cost:</span> ₹{result.totalInterest.toLocaleString("en-IN")} ({((result.totalInterest / result.scenarioDetails.principal) * 100).toFixed(1)}% of principal)
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

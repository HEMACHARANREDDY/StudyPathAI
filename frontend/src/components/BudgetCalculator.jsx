import { useState } from "react";
import { motion } from "framer-motion";
import { FaCalculator, FaRupeeSign, FaChartPie, FaLightbulb } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import toast from "react-hot-toast";

const DEFAULT_BUDGET_FORM = {
  tuitionFee: "2000000",
  livingExpenses: "800000",
  travelCost: "150000",
  insurance: "60000",
  currency: "INR",
  exchangeRate: "1",
  savings: "400000",
  loanAmount: "1200000",
  scholarshipAmount: "200000",
};

const calculateBudgetResult = (formData) => {
  const tuitionFee = parseInt(formData.tuitionFee) || 0;
  const livingExpenses = parseInt(formData.livingExpenses) || 0;
  const travelCost = parseInt(formData.travelCost) || 0;
  const insurance = parseInt(formData.insurance) || 0;
  const savings = parseInt(formData.savings) || 0;
  const loanAmount = parseInt(formData.loanAmount) || 0;
  const scholarshipAmount = parseInt(formData.scholarshipAmount) || 0;

  const totalCost = tuitionFee + livingExpenses + travelCost + insurance;
  const totalFunding = savings + loanAmount + scholarshipAmount;
  const shortfall = totalCost - totalFunding;

  return {
    summary: {
      totalCost,
      totalFunding,
      shortfall,
    },
    breakdown: {
      education: {
        tuition: tuitionFee,
        living: livingExpenses,
        travel: travelCost,
        insurance,
      },
      funding: {
        savings,
        loan: loanAmount,
        scholarship: scholarshipAmount,
      },
    },
    monthly: {
      tuition: Math.round(tuitionFee / 12),
      living: Math.round(livingExpenses / 12),
      total: Math.round(totalCost / 12),
    },
    recommendations: [
      "Reduce monthly expenses by choosing a lower-cost city.",
      "Apply for scholarships and part-time work to cut the shortfall.",
      "Consider a smaller loan package aligned to actual need.",
    ],
  };
};

export default function BudgetCalculator() {
  const [formData, setFormData] = useState(DEFAULT_BUDGET_FORM);
  const [result, setResult] = useState(() => calculateBudgetResult(DEFAULT_BUDGET_FORM));
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateBudget = async () => {
    setLoading(true);
    try {
      const data = calculateBudgetResult(formData);
      setResult(data);
      toast.success("Budget calculated successfully!");
    } catch (err) {
      toast.error("Failed to calculate budget");
    } finally {
      setLoading(false);
    }
  };

  const pieData = result ? [
    { name: "Tuition", value: result.breakdown.education.tuition, color: "#8884d8" },
    { name: "Living", value: result.breakdown.education.living, color: "#82ca9d" },
    { name: "Travel", value: result.breakdown.education.travel, color: "#ffc658" },
    { name: "Insurance", value: result.breakdown.education.insurance, color: "#ff7300" },
  ] : [];

  const fundingData = result ? [
    { name: "Savings", amount: result.breakdown.funding.savings, color: "#10b981" },
    { name: "Loan", amount: result.breakdown.funding.loan, color: "#f59e0b" },
    { name: "Scholarship", amount: result.breakdown.funding.scholarship, color: "#8b5cf6" },
  ] : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FaCalculator className="text-green-400" />
          Advanced Budget Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tuition Fee (Annual)</label>
            <input
              type="number"
              name="tuitionFee"
              value={formData.tuitionFee}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="2000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Living Expenses (Annual)</label>
            <input
              type="number"
              name="livingExpenses"
              value={formData.livingExpenses}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="800000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Travel Cost (One-way)</label>
            <input
              type="number"
              name="travelCost"
              value={formData.travelCost}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Insurance (Annual)</label>
            <input
              type="number"
              name="insurance"
              value={formData.insurance}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Savings</label>
            <input
              type="number"
              name="savings"
              value={formData.savings}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="500000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Expected Loan Amount</label>
            <input
              type="number"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="1500000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scholarship Amount</label>
            <input
              type="number"
              name="scholarshipAmount"
              value={formData.scholarshipAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="200000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Exchange Rate (to INR)</label>
            <input
              type="number"
              name="exchangeRate"
              value={formData.exchangeRate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="1"
              step="0.01"
            />
          </div>
        </div>

        <button
          onClick={calculateBudget}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        >
          {loading ? "Calculating..." : "Calculate Budget"}
        </button>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-blue-400">₹{result.summary.totalCost.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Cost</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-green-400">₹{result.summary.totalFunding.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Funding</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className={`text-3xl font-bold ${result.summary.shortfall > 0 ? 'text-red-400' : 'text-green-400'}`}>
                ₹{Math.abs(result.summary.shortfall).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">{result.summary.shortfall > 0 ? 'Shortfall' : 'Surplus'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaChartPie className="text-blue-400" />
                Cost Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Funding Sources</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fundingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaLightbulb className="text-yellow-400" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <FaLightbulb className="text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">₹{result.monthly.tuition.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Tuition</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-400">₹{result.monthly.living.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Living</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">₹{result.monthly.total.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Monthly</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
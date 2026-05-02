const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

router.post("/plan", async (req, res) => {
  try {
    const { preferredField, targetCountry, gre, ielts } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system", content: "You are a study-abroad coach. Return ONLY valid JSON."
      }, {
        role: "user",
        content: `Create a 9-item 12-month journey plan for a student applying for ${preferredField} in ${targetCountry}. GRE: ${gre}, IELTS: ${ielts}.\nReturn: { "journeyPlan": [{ "month": "Month X", "task": "", "status": "current|upcoming", "priority": "high|medium|low" }] }`
      }],
      max_tokens: 600,
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch {
    res.json({
      journeyPlan: [
        { month: "Month 1–2", task: "Finalize GRE/IELTS prep schedule", status: "current", priority: "high" },
        { month: "Month 3", task: "Give GRE exam", status: "upcoming", priority: "high" },
        { month: "Month 4", task: "Research and shortlist 8 universities", status: "upcoming", priority: "medium" },
        { month: "Month 5–6", task: "Draft SOP and get AI feedback", status: "upcoming", priority: "high" },
        { month: "Month 7", task: "Request Letters of Recommendation", status: "upcoming", priority: "medium" },
        { month: "Month 8–9", task: "Submit all applications", status: "upcoming", priority: "high" },
        { month: "Month 10", task: "Apply for scholarships and financial aid", status: "upcoming", priority: "medium" },
        { month: "Month 11", task: "Receive admits — apply for loan", status: "upcoming", priority: "high" },
        { month: "Month 12", task: "Accept offer and prepare for departure", status: "upcoming", priority: "high" },
      ]
    });
  }
});

module.exports = router;

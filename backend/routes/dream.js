const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

router.post("/profile", async (req, res) => {
  try {
    const { name, gpa, gre, ielts, budget, targetCountry, preferredField } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are StudyPath AI, an expert education counsellor. Return ONLY valid JSON."
      }, {
        role: "user",
        content: `Generate a Student DNA profile and dream score for this student:\nName: ${name}, GPA: ${gpa}/10, GRE: ${gre}, IELTS: ${ielts}\nBudget: ₹${budget}L, Target: ${targetCountry}, Field: ${preferredField}\n\nReturn JSON with:\n{\n  "dreamScore": <number 1-100>,\n  "profileSummary": "<2 sentence summary>",\n  "strengths": ["<strength1>", "<strength2>", "<strength3>"],\n  "improvements": ["<area1>", "<area2>"],\n  "matchedUniversities": [\n    { "name": "", "country": "", "rank": <number>, "admitChance": <number>, "tuition": "₹XXL", "field": "", "logo": "<emoji>" }\n  ]\n}`
      }],
      max_tokens: 1000,
    });

    const data = JSON.parse(completion.choices[0].message.content);
    res.json(data);
  } catch (err) {
    const gpa = parseFloat(req.body.gpa) || 7.5;
    const gre = parseFloat(req.body.gre) || 310;
    const score = Math.min(98, Math.round((gpa / 10) * 40 + (gre / 340) * 40 + 15));
    res.json({
      dreamScore: score,
      profileSummary: `Strong academic profile with CGPA ${gpa} and GRE ${gre}. Well-suited for ${req.body.preferredField} programs in ${req.body.targetCountry}.`,
      strengths: ["Strong GPA", "Relevant field experience", "Clear career goals"],
      improvements: ["Research publications", "Internship experience"],
      matchedUniversities: [
        { name: "University of Toronto", country: "Canada", rank: 18, admitChance: 72, tuition: "₹42L", field: req.body.preferredField, logo: "🍁" },
        { name: "Carnegie Mellon University", country: "USA", rank: 25, admitChance: 58, tuition: "₹68L", field: req.body.preferredField, logo: "🦁" },
        { name: "University of Edinburgh", country: "UK", rank: 32, admitChance: 81, tuition: "₹38L", field: req.body.preferredField, logo: "🏰" },
      ],
    });
  }
});

module.exports = router;

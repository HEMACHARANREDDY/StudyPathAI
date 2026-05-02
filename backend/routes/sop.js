const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

router.post("/generate", async (req, res) => {
  try {
    const { name, gpa, field, targetCountry, additionalInfo } = req.body;
    if (!openai) {
      const demoSOP = [
        "Statement of Purpose - " + (field || "Computer Science"),
        "",
        "I am applying to graduate studies in " + (field || "Computer Science") + " to deepen my ability to solve meaningful real-world problems through technology. With an academic background reflected by a CGPA of " + (gpa || "8.0") + ", I have built a strong foundation in analytical thinking, structured problem-solving, and practical implementation.",
        "",
        additionalInfo ? String(additionalInfo) : "Over the last few years, I have worked on projects that strengthened my interest in advanced computing, data-driven decision making, and systems that can scale responsibly.",
        "",
        "I am particularly motivated to study in " + (targetCountry || "Canada") + " because of its research-focused universities, collaborative academic culture, and strong industry-academia ecosystem. I want to learn from diverse peers and faculty while contributing my own perspective as an Indian student focused on impact at scale.",
        "",
        "In the long term, I plan to build and deploy intelligent products that solve high-impact problems for large user populations. A rigorous graduate program will equip me with advanced technical depth, research discipline, and leadership skills required for this goal.",
        "",
        "I am excited to contribute to your academic community and grow as a researcher and practitioner.",
      ].join("\n");

      return res.json({ sop: demoSOP });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are an expert SOP writer. Write compelling, specific, and authentic Statements of Purpose. Write naturally, avoid clichés."
      }, {
        role: "user",
        content: `Write a compelling 400-word SOP for:\nStudent: ${name}, CGPA: ${gpa}, Field: ${field}, Target: ${targetCountry}\nAdditional info: ${additionalInfo || "None provided"}\nMake it personal, specific, and avoid clichés like "since childhood" or "passionate journey".`
      }],
      max_tokens: 700,
    });
    res.json({ sop: completion.choices[0].message.content });
  } catch {
    res.json({ sop: "Unable to generate SOP right now. Please try again in a moment." });
  }
});

router.post("/roast", async (req, res) => {
  try {
    const { text } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are a brutally honest MIT admissions officer who has read 10,000 SOPs. Return ONLY valid JSON."
      }, {
        role: "user",
        content: `Roast this SOP like a brutal admissions officer. Be honest but constructive.\nSOP: ${text}\n\nReturn JSON: { "score": <0-100>, "grade": "<A/B/C/D/F>", "verdict": "<one harsh sentence>", "issues": [{ "severity": "HIGH|MEDIUM|LOW", "text": "" }], "positives": [""], "suggestion": "<specific actionable advice>" }`
      }],
      max_tokens: 800,
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch {
    res.json({ score: 62, grade: "C+", verdict: "Technically correct but dangerously forgettable.", issues: [{ severity: "HIGH", text: "Opening is generic. Try starting with a specific moment or problem." }], positives: ["Clear structure"], suggestion: "Start with a story that only YOU could tell." });
  }
});

module.exports = router;

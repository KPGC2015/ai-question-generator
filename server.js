import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route
app.post("/generate", async (req, res) => {

  const { topic, difficulty } = req.body;

  const prompt = `
You are a Cambridge IGCSE Computer Science examiner.

Create ONE exam-style question.

Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY valid JSON (no text before or after):

{
  "question": "...",
  "solution": "...",
  "marks": "..."
}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    // 🔴 Check OpenAI response is valid
    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "OpenAI failed" });
    }

    let parsed;

    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Invalid JSON from AI:", data.choices[0].message.content);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    res.json(parsed);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server crashed" });
  }
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));

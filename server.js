import cors from "cors";
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/generate", async (req, res) => {

  const { topic, difficulty } = req.body;

  const prompt = `
  You are a Cambridge IGCSE Computer Science examiner.

  Create an exam-style question.

  Topic: ${topic}
  Difficulty: ${difficulty}

  Include:
  - Question
  - Solution
  - Mark scheme

  Return ONLY JSON:
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
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    res.json(JSON.parse(text));

  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});

app.listen(3000, () => console.log("Running"));

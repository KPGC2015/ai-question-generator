import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Match this exactly to the variable you create in Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cie-generator.html'));
});


// =======================
// EXISTING EXAM GENERATOR
// =======================
app.post('/generate', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is missing in Render environment variables'
      });
    }

    const { topic, difficulty } = req.body;

    const prompt = `
You are a CIE IGCSE Computer Science examiner.

Generate:
1. A realistic exam-style question
2. A full solution
3. A mark scheme

Topic: ${topic}
Difficulty: ${difficulty}

Format your answer exactly like this:

QUESTION:
...

SOLUTION:
...

MARK SCHEME:
...
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Gemini API request failed'
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Unexpected Gemini response:', data);
      return res.status(500).json({
        error: 'Gemini returned an empty response'
      });
    }

    res.json({ result: text });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      error: 'Server failed to process request'
    });
  }
});


// =======================
// NEW AI CHAT ENDPOINT
// =======================
app.post('/ai', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is missing'
      });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'No prompt provided'
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini AI error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'AI request failed'
      });
    }

    res.json(data);

  } catch (error) {
    console.error('AI Server Error:', error);
    res.status(500).json({
      error: 'Server failed to process AI request'
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

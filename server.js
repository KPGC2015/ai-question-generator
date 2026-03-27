import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serves your HTML file

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.post('/generate', async (req, res) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: "You are an expert CIE Examiner. Generate a computer science exam question and a detailed mark scheme based on the topic and difficulty provided." }]
                },
                contents: [{
                    parts: [{ text: `Topic: ${req.body.topic}, Difficulty: ${req.body.difficulty}` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            res.json({ result: aiText });
        } else {
            res.status(500).json({ error: "Invalid response from Gemini" });
        }
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Failed to generate question" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

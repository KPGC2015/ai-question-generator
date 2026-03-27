import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// HOME ROUTE: This serves your HTML file when you visit the main URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cie-generator.html'));
});

// GENERATE ROUTE: This handles the AI logic
app.post('/generate', async (req, res) => {
    try {
        if (!GOOGLE_API_KEY) {
            return res.status(500).json({ error: "API Key is missing on Render settings" });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `You are a CIE IGCSE Computer Science examiner. Generate an exam question, a solution, and a mark scheme for this topic: ${req.body.topic}. Difficulty: ${req.body.difficulty}. Please use clear headings for QUESTION, SOLUTION, and MARK SCHEME.` }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            res.json({ result: data.candidates[0].content.parts[0].text });
        } else {
            console.error("Gemini Error Detail:", data);
            res.status(500).json({ error: "Gemini returned an empty response" });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server failed to process request" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

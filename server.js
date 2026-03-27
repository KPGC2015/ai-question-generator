const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.post('/generate', async (req, res) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: "You are an expert CIE (Cambridge International Education) Examiner. Generate exam questions that match the specific Assessment Objectives (AOs) and command words (e.g., 'Describe', 'Explain', 'Calculate', 'Evaluate') used in CIE papers. Always provide a clear mark scheme." }]
                },
                contents: [{
                    parts: [{ text: `Generate a CIE exam question about: ${req.body.topic}` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        const data = await response.json();
        
        // Google's response is nested. This extracts just the text:
        const aiText = data.candidates[0].content.parts[0].text;
        
        res.json({ result: aiText });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Failed to generate question" });
    }
});
  }
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));

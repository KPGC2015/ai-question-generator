// ... (Your existing imports)

app.post('/ai', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API Key is missing on the server.' });
    }

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

    // Constructing the prompt for the teacher persona
    const safePrompt = `You are a supportive teacher. Help with: ${prompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: safePrompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API Error' });
    }

    // Safely extract the text
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!replyText) {
      return res.status(500).json({ error: 'AI produced an empty response. Try a different question.' });
    }

    res.json({ reply: replyText });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
});

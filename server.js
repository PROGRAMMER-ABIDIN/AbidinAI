// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root

// Environment variable (di Vercel akan diambil dari environment variables)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Endpoint untuk chat AI
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = "meta-llama/llama-4-scout-17b-16e-instruct", temperature = 0.7, max_tokens = 1024 } = req.body;
    
    // Validasi input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Format pesan tidak valid' });
    }

    // Kirim permintaan ke Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error Groq API: ${response.status} - ${errorData.error?.message || 'Error tidak diketahui'}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle semua route untuk SPA
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Export sebagai Vercel serverless function
module.exports = app;

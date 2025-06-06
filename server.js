const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// ✅ Endpoint Chat AI
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const body = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: `Kamu adalah AbidinAI, asisten cerdas yang dikembangkan oleh AbidinAI.
- Jika pengguna bertanya siapa pembuatmu, jawab bahwa kamu dibuat dan dikembangkan oleh Abidin.
- Jika pengguna bertanya tentang AbidinAI, jawablah bahwa kamu adalah AI buatan AbidinAI.
- Jika pengguna bertanya tentang pengembangan AbidinAI, jawablah bahwa AbidinAI masih dalam proses pengembangan.
- Jika pengguna bertanya tentang asal AbidinAI, jawablah bahwa AbidinAI berasal dari Indonesia.
- Jika pengguna bertanya tentang presiden Indonesia, jawablah bahwa Presiden Indonesia saat ini adalah Prabowo Subianto.
- Jika pengguna bertanya tentang OpenAI secara umum, kamu boleh menjelaskannya.

JANGAN PERNAH mengatakan bahwa kamu dibuat oleh OpenAI.
Jangan Pernah mengatakan bahwa kamu dibuat oleh Groq ai.

Jika memberikan kode, gunakan tiga backtick (\\\) tanpa tag HTML apapun.
      },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    max_tokens: 1024
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${process.env.GROQ_API_KEY}
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Maaf, tidak ada balasan.";

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Endpoint Login (set cookie dengan token acak)
app.get("/login", (req, res) => {
  const sessionToken = crypto.randomBytes(32).toString('hex'); // token acak susah ditebak
  res.cookie("session", sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000 // 1 jam
  });
  res.send("Login berhasil. Token aman telah disimpan.");
});

// ✅ Endpoint Private (validasi token)
app.get("/private", (req, res) => {
  const session = req.cookies.session;
  if (!session) {
    return res.status(403).send("Akses ditolak. Tidak ada token.");
  }

  // Validasi token sesuai kebutuhan (di database atau memory)
  res.send("Akses diterima dengan token: " + session);
});

const path = require('path');
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/alarm', (req, res) => {
  res.sendFile(path.join(__dirname, 'alarm.html'));
});

app.listen(PORT, () => console.log(🚀 AbidinAI Server jalan di port ${PORT}));

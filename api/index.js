const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic();

// Stockage simple en mémoire pour l'instant (Phase 2 on met Supabase)
let messages = [];

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    // Ajoute le message utilisateur
    messages.push({
      role: 'user',
      content: message
    });

    // Appelle Claude
    const response = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 1024,
      system: `Tu t'appelles Donald. Tu es l'assistant personnel de Jo qui gère un restaurant appelé L'Essentiel à Le Pradet.
      Tu es intelligent, sympathique, direct et efficace. Tu aides Jo avec:
      - Les emails (Airbnb, Smoobu)
      - Les factures
      - La gestion du temps
      - Les finances
      - La prospection
      
      Sois bref, actionnable, et toujours utile.`,
      messages: messages
    });

    const assistantMessage = response.content[0].text;
    
    // Stocke la réponse
    messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    res.json({
      message: assistantMessage,
      history: messages
    });

  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response from Claude' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', assistant: 'Donald' });
});

// Serve frontend
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Donald is running on port ${PORT}`);
});

module.exports = app;

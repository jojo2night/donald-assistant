export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

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
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const assistantMessage = response.content[0].text;

    return res.status(200).json({
      message: assistantMessage
    });

  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(500).json({ error: 'Failed to get response from Claude', details: error.message });
  }
}
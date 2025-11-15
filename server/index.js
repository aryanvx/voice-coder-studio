import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env first, then allow .env.local to override for local development
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// allow dev origin(s) - adjust as needed
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. LLM proxy will return an error until it is configured.');
}

app.post('/api/llm/generate', async (req, res) => {
  const { lang, name, params = [], fileContext = '', model = 'gpt-4' } = req.body || {};

  if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });

  const paramList = Array.isArray(params) ? params.join(', ') : String(params || '');
  const system = `You are a helpful assistant that writes ${lang} code snippets. Return only the code for the requested function. Do not include explanatory text.`;
  const user = `Implement a ${lang} function named ${name} with parameters: ${paramList}. Use the following file context for style and imports/context:\n\n${fileContext}\n\nReturn only the function code.`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 800,
        temperature: 0.2
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('OpenAI API error:', resp.status, text);
      return res.status(resp.status).json({ error: text });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || null;
    if (!content) return res.json({ success: false, content: null });

    // extract code block if present
    const codeMatch = content.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    const result = codeMatch ? codeMatch[1].trim() + '\n' : content.trim() + '\n';

    res.json({ success: true, content: result });
  } catch (err) {
    console.error('LLM proxy error', err);
    res.status(500).json({ error: 'LLM proxy error' });
  }
});

// health endpoint - indicates whether server has an API key configured
app.get('/api/llm/health', (req, res) => {
  res.json({ enabled: Boolean(OPENAI_KEY) });
});

app.listen(PORT, () => {
  console.log(`LLM proxy listening on http://localhost:${PORT}`);
});

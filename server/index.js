import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env first, then allow .env.local to override for local development
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:8080'
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Multi-provider support
const PROVIDERS = {
  groq: {
    key: process.env.GROQ_API_KEY,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
  },
  openai: {
    key: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini'
  }
};

// Find available providers
const available = Object.entries(PROVIDERS).filter(([_, p]) => p.key).map(([name]) => name);
console.log('Available providers:', available.length ? available.join(', ') : 'NONE');

if (!available.length) {
  console.warn('⚠️  No API keys configured! Add GROQ_API_KEY or OPENAI_API_KEY to .env.local');
}

// Try providers in order until one works
async function callAI(messages) {
  for (const name of available) {
    const p = PROVIDERS[name];
    try {
      console.log(`[AI] Trying ${name}...`);
      const resp = await fetch(p.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${p.key}`
        },
        body: JSON.stringify({
          model: p.model,
          messages,
          max_tokens: 800,
          temperature: 0.2
        })
      });

      if (!resp.ok) {
        const err = await resp.text();
        console.error(`[AI] ${name} failed:`, err.slice(0, 200));
        continue;
      }

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        console.log(`[AI] ✓ ${name} succeeded`);
        return { success: true, content, provider: name };
      }
    } catch (err) {
      console.error(`[AI] ${name} error:`, err.message);
    }
  }
  return { success: false, error: 'All providers failed' };
}

app.post('/api/llm/generate', async (req, res) => {
  const { lang, name, params = [], fileContext = '', aiMode = 'smart', description } = req.body || {};

  console.log('[LLM] Request:', { lang, name, aiMode, description: description?.slice(0, 50) });

  if (!available.length) {
    return res.status(503).json({ error: 'No AI providers configured' });
  }

  const paramList = Array.isArray(params) ? params.join(', ') : String(params || '');

  let system = `You are a code assistant. Return ONLY code, no explanations or markdown.`;
  if (aiMode === 'strict') {
    system += ` Follow instructions EXACTLY. No extra features.`;
  } else {
    system += ` Interpret intent and write complete, useful code.`;
  }

  let user;
  if (description) {
    user = `Write ${lang} code: ${description}`;
    if (name) user += ` Function name: ${name}.`;
    if (paramList) user += ` Parameters: ${paramList}.`;
  } else {
    user = `Write a ${lang} function named ${name} with parameters: ${paramList}.`;
  }

  if (fileContext?.trim()) {
    user += `\n\nContext:\n${fileContext.slice(0, 1000)}`;
  }

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];

  const result = await callAI(messages);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  // Extract code from markdown if present
  let code = result.content;
  const match = code.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (match) code = match[1].trim();
  if (!code.endsWith('\n')) code += '\n';

  console.log(`[LLM] Generated ${code.length} chars via ${result.provider}`);
  res.json({ success: true, content: code, provider: result.provider });
});

app.get('/api/llm/health', (req, res) => {
  res.json({ enabled: available.length > 0, providers: available });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Providers: ${available.join(', ') || 'NONE'}`);
});
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

// Support either name: OPENAI_API_KEY (common) or OPENAI_KEY (older)
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY (or OPENAI_KEY) is not set. LLM proxy will return an error until it is configured.');
} else {
  console.log('LLM proxy configured with OpenAI key (loaded from environment).');
}

app.post('/api/llm/generate', async (req, res) => {
  const { lang, name, params = [], fileContext = '', model = 'gpt-4', aiMode = 'smart', description } = req.body || {};

  console.log('[LLM] Request received:', { lang, name, params: params.length, aiMode, description: description ? description.slice(0, 50) : null });

  if (!OPENAI_KEY) {
    console.error('[LLM] OPENAI_KEY not configured');
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
  }

  const paramList = Array.isArray(params) ? params.join(', ') : String(params || '');

  // Adjust system prompt based on AI mode
  let system = `You are a helpful assistant that writes ${lang} code snippets. Return only the code for the requested function. Do not include explanatory text.`;
  if (aiMode === 'strict') {
    system += ` Follow the user's request EXACTLY as stated—do not add parameters, logic, or features beyond what was explicitly requested.`;
  } else {
    system += ` Feel free to interpret the user's intent and add reasonable parameters, documentation, or helper logic that makes the function more complete and useful.`;
  }
  
  // If a natural-language description was provided, prefer that as the spec.
  let user;
  if (description) {
    const desc = String(description || '');
    user = `Implement a ${lang} function according to the following description: ${desc}.`;
    if (name) user += ` Name the function ${name}.`;
    if (paramList) user += ` If the user provided explicit parameters, use them: ${paramList}.`;
    user += ` Use the following file context for style and imports/context:\n\n${fileContext}\n\nReturn only the function code.`;
  } else {
    user = `Implement a ${lang} function named ${name} with parameters: ${paramList}. Use the following file context for style and imports/context:\n\n${fileContext}\n\nReturn only the function code.`;
  }

  console.log('[LLM] System prompt:', system.slice(0, 100) + '...');
  console.log('[LLM] User prompt:', user.slice(0, 100) + '...');

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

    console.log('[LLM] OpenAI response status:', resp.status);

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[LLM] OpenAI API error:', resp.status, text);
      return res.status(resp.status).json({ error: 'OpenAI API error: ' + text });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || null;
    if (!content) {
      console.warn('[LLM] No content in OpenAI response');
      return res.json({ success: false, content: null });
    }

    // extract code block if present
    const codeMatch = content.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    const result = codeMatch ? codeMatch[1].trim() + '\n' : content.trim() + '\n';

    console.log('[LLM] Generated code length:', result.length);
    res.json({ success: true, content: result });
  } catch (err) {
    console.error('[LLM] Proxy error', err.message);
    res.status(500).json({ error: 'LLM proxy error: ' + err.message });
  }
});

// health endpoint - indicates whether server has an API key configured
app.get('/api/llm/health', (req, res) => {
  res.json({ enabled: Boolean(OPENAI_KEY) });
});

app.listen(PORT, () => {
  console.log(`LLM proxy listening on http://localhost:${PORT}`);
});

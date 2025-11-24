const PROVIDERS = {
  groq: {
    key: process.env.GROQ_API_KEY,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
  },
  openai: {
    key: process.env.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini'
  }
};

const available = Object.entries(PROVIDERS).filter(([_, p]) => p.key).map(([name]) => name);

async function callAI(messages) {
  for (const name of available) {
    const p = PROVIDERS[name];
    try {
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

      if (!resp.ok) continue;

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        return { success: true, content, provider: name };
      }
    } catch (err) {
      console.error(`${name} error:`, err.message);
    }
  }
  return { success: false, error: 'All providers failed' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lang, name, params = [], fileContext = '', aiMode = 'smart', description } = req.body || {};

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

  let code = result.content;
  const match = code.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (match) code = match[1].trim();
  if (!code.endsWith('\n')) code += '\n';

  res.json({ success: true, content: code, provider: result.provider });
}
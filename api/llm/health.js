export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const providers = [];
  
  if (hasGroq) providers.push('groq');
  if (hasOpenAI) providers.push('openai');

  res.json({ 
    enabled: providers.length > 0,
    providers 
  });
}
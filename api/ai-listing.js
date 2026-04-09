export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { product, store } = req.body;
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI not configured.' });
  if (!product) return res.status(400).json({ error: 'Product name required.' });
  const prompt = `You are a Nigerian e-commerce expert. For: "${product}", generate a deal listing. Return ONLY valid JSON: {"name":"full name","brand":"brand","category":"Smartphones/Laptops/Gaming/Electronics/Accessories/Appliances/Fashion","price":NGN_number,"originalPrice":NGN_number,"store":"${store||'Jumia'}","storeUrl":"https://...","tag":"HOT/NEW/SALE/LIMITED or empty","quantity":10,"description":"2 sentences","keySpecs":["spec1","spec2","spec3"]} USD/NGN ~1600.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 500, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await r.json();
    const text = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim();
    return res.status(200).json({ listing: JSON.parse(text) });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}

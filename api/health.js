export default function handler(req, res) {
  res.status(200).json({ status: 'ok', service: 'QuickCart Nigeria v2.0 — Big Upgrade', ai: process.env.CLAUDE_API_KEY ? 'ready' : 'no key', time: new Date().toISOString() });
}

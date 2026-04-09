// /api/go.js — QuickCart Affiliate Redirect
// No dependencies — uses Firebase REST API directly via fetch

const FIREBASE_URL = 'https://sneakerai-c96f0-default-rtdb.firebaseio.com';

const STORE_PARAMS = {
  'jumia': 'tag', 'konga': 'utm_source', 'slot': 'ref',
  '3c hub': 'ref', 'pointek': 'ref', 'fouani': 'ref',
  'kara': 'ref', 'jiji': 'ref', 'garmspot': 'ref', 'sims nigeria': 'ref'
};

const STORE_KEYS = { 'jumia': 'jumia', 'konga': 'konga', 'slot': 'slot', 'jiji': 'jiji' };

export default async function handler(req, res) {
  const { store = '', url = '', name = '', price = '' } = req.query;

  // Decode and validate URL
  let destUrl = '';
  try {
    destUrl = decodeURIComponent(url);
    if (!destUrl.startsWith('http')) throw new Error('bad');
    new URL(destUrl);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, '/');
  }

  const storeLower = (store || '').toLowerCase();
  const storeKey = STORE_KEYS[storeLower];

  try {
    if (storeKey) {
      const fbRes = await fetch(`${FIREBASE_URL}/settings/affiliate_links/${storeKey}.json`);
      const affTag = await fbRes.json();
      if (affTag && typeof affTag === 'string' && affTag.trim()) {
        const param = STORE_PARAMS[storeLower] || 'ref';
        try {
          const parsed = new URL(destUrl);
          parsed.searchParams.set(param, affTag.trim());
          destUrl = parsed.toString();
        } catch (e) {
          destUrl += (destUrl.includes('?') ? '&' : '?') + param + '=' + encodeURIComponent(affTag.trim());
        }
      }
    }
    // Log click (fire and forget)
    fetch(`${FIREBASE_URL}/affiliate_clicks.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store: decodeURIComponent(store), name: decodeURIComponent(name), price: Number(price)||0, ts: Date.now() })
    }).catch(() => {});
    fetch(`${FIREBASE_URL}/affiliate_stats/${encodeURIComponent(storeLower)}/clicks.json`)
      .then(r => r.json())
      .then(n => fetch(`${FIREBASE_URL}/affiliate_stats/${encodeURIComponent(storeLower)}/clicks.json`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify((n||0)+1)
      })).catch(() => {});
  } catch (e) { console.error('go.js:', e.message); }

  res.setHeader('Cache-Control', 'no-store, no-cache');
  return res.redirect(302, destUrl);
}

// Vercel serverless function — server-side proxy to the Anthropic API.
// The Claude key lives ONLY here (ANTHROPIC_API_KEY), never in the browser bundle.
// An optional shared passcode (APP_PASSCODE) gates access so a public URL can't
// burn your credit. Set both in the Vercel project's Environment Variables.

export default async function handler(req, res) {
  const serverKey = process.env.ANTHROPIC_API_KEY
  const passcode = process.env.APP_PASSCODE || ''
  const provided = req.headers['x-app-passcode'] || ''
  const authorized = !passcode || provided === passcode

  // Health / passcode check — the client calls this to decide what to show.
  if (req.method === 'GET') {
    res.status(authorized ? 200 : 401).json({
      ok: authorized,
      requiresPasscode: Boolean(passcode),
      configured: Boolean(serverKey),
    })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!authorized) {
    res.status(401).json({ error: 'Invalid passcode' })
    return
  }
  if (!serverKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const { model, max_tokens, system, messages } = body
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': serverKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-5',
        max_tokens: max_tokens || 800,
        system,
        messages,
      }),
    })
    const text = await upstream.text()
    res.setHeader('content-type', 'application/json')
    res.status(upstream.status).send(text)
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed', detail: String(e) })
  }
}

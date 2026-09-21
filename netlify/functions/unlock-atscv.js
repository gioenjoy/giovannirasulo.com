// Sblocco materiali della pagina "grazie" di ATS CV Optimize:
// verifica il pagamento su Stripe e restituisce il link al pacchetto .zip SOLO se
// la sessione risulta pagata. Stesso pattern di netlify/functions/unlock-fantaclaude.js,
// ma prodotto separato (un solo piano, un solo prezzo).
//
// Richiede su Netlify (Site settings > Environment variables):
//   STRIPE_SECRET_KEY -> la stessa chiave segreta Stripe già usata per gli altri unlock
//   LINK_ATSCV_ZIP    -> URL (Google Drive o simile) del pacchetto ats-cv-optimize.zip
//
// Runtime: Node 18+ (fetch globale disponibile su Netlify Functions).

exports.handler = async function (event) {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const sid = (event.queryStringParameters || {}).session_id;

  if (!sid) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'missing_session_id' }) };
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'not_configured' }) };
  }

  const zip = process.env.LINK_ATSCV_ZIP;
  if (!zip) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'missing_link' }) };
  }

  try {
    const res = await fetch(
      'https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sid),
      { headers: { Authorization: 'Bearer ' + key } }
    );
    if (!res.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: false }) };
    }
    const s = await res.json();

    const paid = s.payment_status === 'paid' || s.status === 'complete';
    if (!paid) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: false }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        links: { zip },
        value: (s.amount_total || 0) / 100,
        currency: (s.currency || 'eur').toUpperCase(),
        transaction_id: s.id,
      }),
    };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: 'exception' }) };
  }
};

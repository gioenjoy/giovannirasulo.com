// Sblocco materiali della pagina "grazie" di FantaClaude (Fantacalcio Asta Skill):
// verifica il pagamento su Stripe e restituisce i link ai materiali SOLO se la
// sessione risulta pagata. Stesso pattern di netlify/functions/unlock.js,
// ma prodotto separato (un solo piano, un solo prezzo).
//
// Richiede su Netlify (Site settings > Environment variables):
//   STRIPE_SECRET_KEY -> la stessa chiave segreta Stripe già usata per unlock.js
//   LINK_FANTACLAUDE_SKILL -> URL Google Drive del file .skill
//   LINK_FANTACLAUDE_GUIDA_MD -> URL Google Drive del file guida-fantacalcio-skill-claude.md
//     (i valori qui sotto sono i default già impostati; puoi sovrascriverli
//     con una env var dello stesso nome se un link cambia in futuro)
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

    const links = {
      skill: process.env.LINK_FANTACLAUDE_SKILL || 'https://drive.google.com/file/d/1EHsyhGEsHiahlUZJT_zMOaQ0jhsvugCC/view?usp=sharing',
      guidamd: process.env.LINK_FANTACLAUDE_GUIDA_MD || 'https://drive.google.com/file/d/1O5sv3mfULCKfKScG3RfbSR-qMsV18r0m/view?usp=sharing',
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        links,
        value: (s.amount_total || 0) / 100,
        currency: (s.currency || 'eur').toUpperCase(),
        transaction_id: s.id,
      }),
    };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: 'exception' }) };
  }
};

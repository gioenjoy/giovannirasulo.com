// Sblocco materiali del thank-you: verifica il pagamento su Stripe e restituisce
// i link ai materiali SOLO se la sessione risulta pagata.
//
// Richiede su Netlify (Site settings > Environment variables):
//   STRIPE_SECRET_KEY   -> la tua chiave segreta Stripe (sk_live_...)
//   LINK_PDF, LINK_TEMPLATE, LINK_VIDEO, LINK_CALL -> gli URL reali dei materiali
//     (in alternativa sostituisci i 'REPLACE_...' qui sotto, ma le env var sono più sicure)
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

    const L = {
      pdf: process.env.LINK_PDF || 'REPLACE_PDF_URL',
      template: process.env.LINK_TEMPLATE || 'REPLACE_TEMPLATE_URL',
      video: process.env.LINK_VIDEO || 'REPLACE_VIDEO_URL',
      call: process.env.LINK_CALL || 'REPLACE_CALENDLY_URL',
    };

    const amt = s.amount_total || 0; // in centesimi
    let plan, links;
    if (amt >= 19700) {
      plan = 'vip';
      links = { pdf: L.pdf, template: L.template, video: L.video, call: L.call };
    } else if (amt >= 9700) {
      plan = 'percorso';
      links = { pdf: L.pdf, template: L.template, video: L.video };
    } else {
      plan = 'starter';
      links = { pdf: L.pdf, template: L.template };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        plan,
        links,
        value: amt / 100,
        currency: (s.currency || 'eur').toUpperCase(),
        transaction_id: s.id,
      }),
    };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: 'exception' }) };
  }
};

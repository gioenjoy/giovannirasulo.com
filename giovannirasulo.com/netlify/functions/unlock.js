// Sblocco materiali del thank-you: verifica il pagamento su Stripe e restituisce
// i link ai materiali SOLO se la sessione risulta pagata.
//
// Pricing attuale (2 piani, aggiornato 2026-07-08):
//   Il Sistema           27€  -> pdf, emailtemplates, smartpolicy, checklist, companies, ebook
//   Il Percorso+Supporto 147€ -> tutto sopra + bonus (Notion) + call (Google Calendar)
//
// Richiede su Netlify (Site settings > Environment variables):
//   STRIPE_SECRET_KEY -> la tua chiave segreta Stripe (sk_live_...)
//   LINK_PDF, LINK_EMAILTEMPLATES, LINK_SMARTPOLICY, LINK_CHECKLIST,
//   LINK_COMPANIES, LINK_EBOOK, LINK_BONUS, LINK_CALL -> gli URL reali dei materiali
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

    const L = {
      pdf: process.env.LINK_PDF || 'https://drive.google.com/file/d/1QePvTfQ1VY77Fssq59nVOYnm3x2wfW1D/view?usp=sharing',
      emailtemplates: process.env.LINK_EMAILTEMPLATES || 'https://docs.google.com/document/d/14Qyelsn71yozRQvkSsPqcDoF0y-RU8_-vljT4Ix26do/edit?usp=sharing',
      smartpolicy: process.env.LINK_SMARTPOLICY || 'https://drive.google.com/file/d/1CXFEuEFP0YHnFiIYzDSKXaqfF0Mvj16I/view?usp=sharing',
      checklist: process.env.LINK_CHECKLIST || 'https://drive.google.com/file/d/1ltqPCugmfFrptfa79msVU_UhhBmrxaA8/view?usp=sharing',
      companies: process.env.LINK_COMPANIES || 'https://drive.google.com/file/d/1sff66CLcvWCDXW_CF26_a8C-LFgJ8_Fj/view?usp=sharing',
      ebook: process.env.LINK_EBOOK || 'https://drive.google.com/file/d/1K1OwAzis_UeJTqCEjnm0BcVRkEVF7m0v/view?usp=sharing',
      bonus: process.env.LINK_BONUS || 'https://gem-bottom-fd8.notion.site/sistema-produttivita-dal-controllo-alla-fiducia',
      call: process.env.LINK_CALL || 'https://calendar.app.google/vPu1DdLUL8EsQyDb6',
    };

    // Il Sistema (27€): guida + 4 strumenti pratici + eBook.
    // Il Percorso + Supporto (147€): tutto sopra + bonus Notion + prenotazione sessioni 1:1.
    // Soglia a metà tra i due prezzi (100€) per tollerare eventuali arrotondamenti Stripe.
    const amt = s.amount_total || 0; // in centesimi
    let plan, links;
    const starterLinks = {
      pdf: L.pdf,
      emailtemplates: L.emailtemplates,
      smartpolicy: L.smartpolicy,
      checklist: L.checklist,
      companies: L.companies,
      ebook: L.ebook,
    };
    if (amt >= 10000) {
      plan = 'percorso_supporto';
      links = { ...starterLinks, bonus: L.bonus, call: L.call };
    } else {
      plan = 'starter';
      links = { ...starterLinks };
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

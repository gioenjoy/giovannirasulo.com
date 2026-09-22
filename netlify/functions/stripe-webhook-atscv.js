// Webhook Stripe per ATS CV Optimize: a pagamento completato manda all'acquirente
// un'email (via Resend) con il link al pacchetto .zip. È una copia di riserva:
// il download principale resta sulla pagina /cv-ats-skill-claude/grazie/.
//
// Stripe non permette link personalizzati nelle ricevute, da qui questa function.
// L'endpoint riceve TUTTE le vendite dell'account Stripe (anche FantaClaude e le
// altre): invia l'email solo per le sessioni nate dal Payment Link di ATS CV Optimize.
//
// Richiede su Netlify (Site settings > Environment variables):
//   STRIPE_WEBHOOK_SECRET_ATSCV -> "Signing secret" dell'endpoint webhook (whsec_...)
//   ATSCV_PAYMENT_LINK_ID       -> ID del Payment Link da 7€ (plink_...)
//   RESEND_API_KEY              -> API key di Resend (re_...)
//   LINK_ATSCV_ZIP              -> già presente, URL del file .zip su Drive
//   ATSCV_EMAIL_FROM (facoltativa) -> mittente, default "Giovanni Rasulo <marketing@giovannirasulo.com>"
//
// Endpoint da registrare su Stripe:
//   https://www.giovannirasulo.com/.netlify/functions/stripe-webhook-atscv
// Eventi: checkout.session.completed, checkout.session.async_payment_succeeded
//
// Runtime: Node 18+ (fetch e crypto disponibili su Netlify Functions).

const crypto = require('crypto');

const TOLERANCE_SEC = 300; // stessa tolleranza della libreria ufficiale Stripe

function verifySignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = header.split(',').reduce((acc, kv) => {
    const i = kv.indexOf('=');
    const k = kv.slice(0, i).trim();
    const v = kv.slice(i + 1).trim();
    (acc[k] = acc[k] || []).push(v);
    return acc;
  }, {});
  const t = (parts.t || [])[0];
  const sigs = parts.v1 || [];
  if (!t || !sigs.length) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > TOLERANCE_SEC) return false;

  const expected = crypto.createHmac('sha256', secret).update(t + '.' + rawBody, 'utf8').digest('hex');
  const exp = Buffer.from(expected, 'hex');
  return sigs.some((s) => {
    const got = Buffer.from(s, 'hex');
    return got.length === exp.length && crypto.timingSafeEqual(got, exp);
  });
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function buildEmail(name, zip) {
  const first = (name || '').trim().split(/\s+/)[0];
  const hello = first ? 'Ciao ' + first + ',' : 'Ciao,';
  const guida = 'https://www.giovannirasulo.com/cv-ats-skill-claude/guida/';

  const text = [
    hello,
    '',
    'grazie per aver acquistato ATS CV Optimize. Ecco il link al pacchetto, nel caso tu non l\'abbia già scaricato dalla pagina di conferma:',
    '',
    zip,
    '',
    'Come iniziare:',
    '1. Scarica e scompatta lo .zip.',
    '2. Carica la cartella su Claude: su claude.ai dalle impostazioni delle skill, su Claude Code copiandola in ~/.claude/skills/.',
    '3. Per generare il file Word installa python-docx: pip3 install python-docx',
    '4. Allega il tuo CV e scrivi in italiano, ad esempio: "Sistemami il curriculum per questo annuncio".',
    '',
    'Guida completa con prompt ed esempi: ' + guida,
    '',
    'Se hai domande rispondi pure a questa email: rispondo di solito entro 24 ore.',
    '',
    'Giovanni Rasulo',
    'giovannirasulo.com',
  ].join('\n');

  const html = `<!DOCTYPE html><html lang="it"><body style="margin:0;padding:0;background:#EAF0F7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAF0F7;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0F2840;padding:28px 32px;">
  <div style="color:#A8BCE0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">Acquisto confermato</div>
  <div style="color:#ffffff;font-size:24px;font-weight:bold;margin-top:6px;">ATS CV Optimize</div>
</td></tr>
<tr><td style="padding:28px 32px;color:#1A2535;font-size:15px;line-height:1.65;">
  <p style="margin:0 0 14px;">${esc(hello)}</p>
  <p style="margin:0 0 22px;">grazie per aver acquistato ATS CV Optimize. Ecco il link al pacchetto, nel caso tu non l'abbia già scaricato dalla pagina di conferma.</p>
  <p style="margin:0 0 26px;text-align:center;">
    <a href="${esc(zip)}" style="display:inline-block;background:#E96944;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:100px;">Scarica il pacchetto .zip</a>
  </p>
  <p style="margin:0 0 8px;font-weight:bold;">Come iniziare</p>
  <ol style="margin:0 0 22px;padding-left:20px;color:#2E3F55;">
    <li style="margin-bottom:6px;">Scarica e scompatta lo .zip.</li>
    <li style="margin-bottom:6px;">Carica la cartella su Claude: su claude.ai dalle impostazioni delle skill, su Claude Code copiandola in <code>~/.claude/skills/</code>.</li>
    <li style="margin-bottom:6px;">Per generare il file Word installa python-docx: <code>pip3 install python-docx</code></li>
    <li>Allega il tuo CV e scrivi in italiano, ad esempio: «Sistemami il curriculum per questo annuncio».</li>
  </ol>
  <p style="margin:0 0 22px;">La <a href="${guida}" style="color:#3B6EA5;">guida completa</a> ha prompt pronti ed esempi.</p>
  <p style="margin:0;color:#5C7A99;font-size:14px;">Se hai domande rispondi pure a questa email: rispondo di solito entro 24 ore.</p>
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #EAF0F7;color:#8FAAC0;font-size:12px;">
  Giovanni Rasulo · <a href="https://www.giovannirasulo.com" style="color:#8FAAC0;">giovannirasulo.com</a> · P.IVA 04088780129
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { text, html };
}

exports.handler = async function (event) {
  const ok = (msg) => ({ statusCode: 200, body: JSON.stringify({ received: true, note: msg }) });

  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const secret = process.env.STRIPE_WEBHOOK_SECRET_ATSCV;
  const plink = process.env.ATSCV_PAYMENT_LINK_ID;
  const resendKey = process.env.RESEND_API_KEY;
  const zip = process.env.LINK_ATSCV_ZIP;
  const from = process.env.ATSCV_EMAIL_FROM || 'Giovanni Rasulo <marketing@giovannirasulo.com>';
  if (!secret || !plink || !resendKey || !zip) {
    console.error('stripe-webhook-atscv: variabili d\'ambiente mancanti');
    return { statusCode: 500, body: 'not_configured' };
  }

  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  const h = event.headers || {};
  if (!verifySignature(raw, h['stripe-signature'] || h['Stripe-Signature'], secret)) {
    return { statusCode: 400, body: 'invalid_signature' };
  }

  let evt;
  try { evt = JSON.parse(raw); } catch (e) { return { statusCode: 400, body: 'invalid_json' }; }

  const type = evt.type;
  if (type !== 'checkout.session.completed' && type !== 'checkout.session.async_payment_succeeded') {
    return ok('evento ignorato');
  }

  const s = (evt.data && evt.data.object) || {};
  if (s.payment_link !== plink) return ok('altro prodotto');
  // Con metodi di pagamento differiti "completed" arriva prima dell'incasso:
  // l'email parte con async_payment_succeeded.
  if (s.payment_status !== 'paid') return ok('pagamento non ancora incassato');

  const to = (s.customer_details && s.customer_details.email) || s.customer_email;
  if (!to) {
    console.error('stripe-webhook-atscv: sessione senza email', s.id);
    return ok('email acquirente assente');
  }

  const { text, html } = buildEmail(s.customer_details && s.customer_details.name, zip);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + resendKey,
      'Content-Type': 'application/json',
      // Stripe può ripetere lo stesso evento: la chiave evita email doppie
      'Idempotency-Key': 'atscv-' + s.id,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: 'marketing@giovannirasulo.com',
      subject: 'Il tuo ATS CV Optimize: link per il download',
      text,
      html,
    }),
  });

  if (!res.ok) {
    // 500: Stripe riprova da solo nelle ore successive
    console.error('stripe-webhook-atscv: Resend ha risposto', res.status, await res.text());
    return { statusCode: 500, body: 'email_failed' };
  }
  return ok('email inviata');
};

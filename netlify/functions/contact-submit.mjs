/**
 * Netlify Function – receives contact form POST directly.
 *
 * Required env vars in Netlify (Site settings → Environment variables):
 *   RESEND_API_KEY   – API key from https://resend.com
 *
 * Optional:
 *   CONTACT_EMAIL    – Recipient, defaults to franko.safradin13@gmail.com
 *   RESEND_FROM      – Verified sender, defaults to Resend sandbox
 */

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailHtml({ name, email, phone, interest, location, message }) {
  const rows = [
    ['Vollständiger Name', escapeHtml(name)],
    ['E-Mail-Adresse', `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`],
    ['Telefonnummer', `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`],
    ['Ich interessiere mich für', escapeHtml(interest)],
    ['Standort', escapeHtml(location)],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:12px 16px;font-weight:600;color:#1a1a1a;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:12px 16px;color:#4a4a4a;border-bottom:1px solid #eee;">${value}</td>
      </tr>`
    )
    .join('');

  const messageBlock = message
    ? `<tr>
        <td colspan="2" style="padding:16px;color:#1a1a1a;">
          <strong>Ihre Nachricht</strong>
          <p style="margin:8px 0 0;color:#4a4a4a;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </td>
      </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#0a0a0a;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;font-size:20px;color:#d4af37;font-weight:600;letter-spacing:0.5px;">Fine Sound Academy</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;">
            <h2 style="margin:0 0 4px;font-size:18px;color:#1a1a1a;">Neue Kontaktanfrage</h2>
            <p style="margin:0;font-size:13px;color:#999;">Probestunde / Kontaktformular</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${tableRows}
              ${messageBlock}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;text-align:center;">
            <a href="mailto:${escapeHtml(email)}" style="display:inline-block;padding:12px 28px;background:#d4af37;color:#0a0a0a;text-decoration:none;font-weight:600;font-size:14px;border-radius:4px;">Antworten an ${escapeHtml(name)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;">
            Diese E-Mail wurde automatisch über das Kontaktformular gesendet.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let fields;
  try {
    const params = new URLSearchParams(event.body);
    fields = {
      name: (params.get('name') || '').trim(),
      email: (params.get('email') || '').trim(),
      phone: (params.get('phone') || '').trim(),
      interest: (params.get('interest') || '').trim(),
      location: (params.get('location') || '').trim(),
      message: (params.get('message') || '').trim(),
      website: (params.get('website') || '').trim(),
    };
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid form data' }) };
  }

  if (fields.website) {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const maxLen = { name: 200, email: 254, phone: 30, interest: 50, location: 50, message: 2000 };
  if (!fields.name || !fields.email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and email are required' }) };
  }
  if (!emailRe.test(fields.email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email address' }) };
  }
  if (fields.name.length > maxLen.name || fields.email.length > maxLen.email || fields.phone.length > maxLen.phone
      || fields.interest.length > maxLen.interest || fields.location.length > maxLen.location || fields.message.length > maxLen.message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'One or more fields exceed maximum length' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'franko.safradin13@gmail.com';
  const RESEND_FROM = process.env.RESEND_FROM || 'Fine Sound Academy <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const html = buildEmailHtml(fields);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [CONTACT_EMAIL],
      reply_to: fields.email,
      subject: `Neue Kontaktanfrage / Probestunde – ${fields.name}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email could not be sent' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
}

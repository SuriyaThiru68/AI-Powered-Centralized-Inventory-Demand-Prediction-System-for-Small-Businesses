/**
 * OrbitLink Alert Service
 * Sends low-stock / reorder alerts via:
 *   1. Email   — Nodemailer (Gmail / any SMTP)
 *   2. WhatsApp — Twilio WhatsApp sandbox
 *
 * Config (add to .env):
 *   EMAIL_FROM        — sender address          e.g. alerts@orbitlink.app
 *   EMAIL_PASS        — Gmail App Password or SMTP password
 *   EMAIL_HOST        — default: smtp.gmail.com
 *   EMAIL_PORT        — default: 587
 *
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM — e.g. whatsapp:+14155238886 (Twilio sandbox number)
 */

const nodemailer = require('nodemailer');

// ─── Email ────────────────────────────────────────────────────────────────────
function createTransporter() {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[Alert] Email not configured — add EMAIL_FROM + EMAIL_PASS to .env');
    return { sent: false, reason: 'not_configured' };
  }
  try {
    const info = await transporter.sendMail({
      from: `"OrbitLink Alerts" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`[Alert] Email sent to ${to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Alert] Email error:', err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── WhatsApp (Twilio) ────────────────────────────────────────────────────────
async function sendWhatsApp({ to, body }) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!sid || !token) {
    console.warn('[Alert] WhatsApp not configured — add TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN to .env');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const twilio = require('twilio')(sid, token);
    const msg = await twilio.messages.create({
      from,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body,
    });
    console.log(`[Alert] WhatsApp sent to ${to}: ${msg.sid}`);
    return { sent: true, sid: msg.sid };
  } catch (err) {
    console.error('[Alert] WhatsApp error:', err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── HTML email template ──────────────────────────────────────────────────────
function buildAlertEmail({ storeName, alerts, type }) {
  const rows = alerts
    .map(
      (a) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;font-weight:600">${a.name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;color:#5c6b7a">${a.sku || '—'}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;color:${a.quantity === 0 ? '#c0392b' : '#b45309'};font-weight:700">${a.quantity}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eee">
          <span style="background:${a.quantity === 0 ? '#fdecea' : '#fff8e1'};color:${a.quantity === 0 ? '#c0392b' : '#b45309'};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700">
            ${a.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
          </span>
        </td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f1923,#1a2836);padding:28px 32px;display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;background:#e85d04;border-radius:10px;display:flex;align-items:center;justify-content:center">
        <span style="color:#fff;font-size:20px">🔗</span>
      </div>
      <div>
        <div style="color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.02em">OrbitLink</div>
        <div style="color:rgba(255,255,255,0.55);font-size:12px">Inventory Alert</div>
      </div>
    </div>
    <!-- Body -->
    <div style="padding:28px 32px">
      <h2 style="margin:0 0 8px;color:#1a2836;font-size:20px">⚠️ ${type === 'out' ? 'Out of Stock' : 'Low Stock'} Alert</h2>
      <p style="margin:0 0 20px;color:#5c6b7a">The following products in <strong>${storeName}</strong> need your attention:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f4f6f8">
            <th style="padding:10px 16px;text-align:left;color:#8a97a6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Product</th>
            <th style="padding:10px 16px;text-align:left;color:#8a97a6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">SKU</th>
            <th style="padding:10px 16px;text-align:left;color:#8a97a6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Qty</th>
            <th style="padding:10px 16px;text-align:left;color:#8a97a6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:24px;padding:16px;background:#fff4ed;border-radius:10px;border-left:4px solid #e85d04">
        <p style="margin:0;color:#1a2836;font-size:13px">
          <strong>Action required:</strong> Log in to your OrbitLink dashboard to review reorder suggestions and create purchase orders.
        </p>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;background:#f4f6f8;text-align:center;color:#8a97a6;font-size:12px">
      OrbitLink — AI-Powered Inventory Management · <a href="#" style="color:#e85d04">Manage alert preferences</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── WhatsApp message template ────────────────────────────────────────────────
function buildWhatsAppMessage({ storeName, alerts }) {
  const lines = alerts
    .slice(0, 10)
    .map((a) => `• ${a.name} — ${a.quantity === 0 ? '🔴 OUT OF STOCK' : `🟡 ${a.quantity} left`}`)
    .join('\n');
  return `🔗 *OrbitLink Alert*\n\n⚠️ *Low Stock Warning* for *${storeName}*\n\n${lines}${alerts.length > 10 ? `\n...and ${alerts.length - 10} more` : ''}\n\nLog in to your dashboard to review reorder suggestions.`;
}

// ─── Main export: send alerts ─────────────────────────────────────────────────
/**
 * sendAlerts({ storeName, alerts, channels: { email, whatsapp }, alertSettings })
 *
 * alertSettings = { emailTo, whatsappTo }
 * alerts = [{ name, sku, quantity }]
 */
async function sendAlerts({ storeName, alerts, alertSettings = {} }) {
  if (!alerts || alerts.length === 0) return { email: null, whatsapp: null };

  const outOfStock = alerts.filter((a) => a.quantity === 0);
  const lowStock   = alerts.filter((a) => a.quantity > 0);
  const type       = outOfStock.length > 0 ? 'out' : 'low';

  const results = {};

  // Email
  if (alertSettings.emailTo) {
    results.email = await sendEmail({
      to: alertSettings.emailTo,
      subject: `[OrbitLink] ${type === 'out' ? '🔴 Out of Stock' : '🟡 Low Stock'} — ${alerts.length} product(s) need attention`,
      html: buildAlertEmail({ storeName, alerts, type }),
    });
  }

  // WhatsApp
  if (alertSettings.whatsappTo) {
    results.whatsapp = await sendWhatsApp({
      to: alertSettings.whatsappTo,
      body: buildWhatsAppMessage({ storeName, alerts }),
    });
  }

  return results;
}

module.exports = { sendAlerts, sendEmail, sendWhatsApp };

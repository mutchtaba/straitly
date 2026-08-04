/* Straitly mailer — tiny Cloud Run service that holds the Resend key so the
   public Netlify site never needs the secret. Accepts ONLY the qualification
   application shape and sends exactly two fixed-template emails, so it can't
   be abused as a general relay. */

import http from "node:http";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "Straitly <team@straitly.ai>";
const ALERT_TO = process.env.ALERT_TO ?? "hashims@xynth.finance";
const PORT = process.env.PORT || 8080;

/* ---------- templates (mirror of src/lib/emails.ts) ---------- */

const CREAM = "#e8e3d8";
const CHARCOAL = "#2f3136";
const CHARCOAL_DEEP = "#26282c";
const TERRACOTTA = "#c8734f";
const AMBER = "#e8a33d";
const BODY_GRAY = "#c4beb4";
const MUTED = "#8d9098";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function layout(inner, preheader) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Straitly</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:0 0 20px 4px;">
  <span style="font-family:${MONO};font-size:18px;font-weight:700;letter-spacing:0.18em;color:${CHARCOAL};">STRAITLY</span>
</td></tr>
<tr><td style="background-color:${CHARCOAL};border-top:4px solid ${TERRACOTTA};padding:40px 44px;">
${inner}
</td></tr>
<tr><td style="padding:20px 4px 0;">
  <p style="margin:0;font-family:${SANS};font-size:12px;color:#a29b8e;">
    You're receiving this because you applied at straitly.ai.
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const label = (t) =>
  `<p style="margin:0 0 10px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;color:${AMBER};">${t}</p>`;
const h1 = (t) =>
  `<h1 style="margin:0 0 18px;font-family:${SANS};font-size:26px;line-height:1.25;font-weight:700;color:${CREAM};">${t}</h1>`;
const p = (t) =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${BODY_GRAY};">${t}</p>`;
const esc = (v) =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function applicationReceivedEmail() {
  const inner = `
${label("APPLICATION RECEIVED")}
${h1("You're in the queue.")}
${p(`Review takes <strong style="color:${CREAM};">1&ndash;2 hours</strong>. If you qualify, your API key and <strong style="color:${CREAM};">$100 in trial credits</strong> arrive in your next email.`)}
${p("No sales call. No commitment.")}`;
  return {
    subject: "Application received — Straitly",
    html: layout(inner, "We got your application. Review takes 1-2 hours."),
  };
}

function internalAlertEmail(app) {
  const rows = [
    ["EMAIL", app.email],
    ["SPEND", app.spend],
    ["PROVIDERS", app.providers.join(", ") || "—"],
    ["MODELS", app.models || "—"],
    ["COMPANY", app.company || "—"],
    ["COUNTRY", app.country],
    ["SUBMITTED", new Date().toISOString()],
  ];
  const table = rows
    .map(
      ([k, v]) => `<tr>
<td style="padding:9px 18px 9px 0;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.18em;color:${AMBER};white-space:nowrap;vertical-align:top;">${k}</td>
<td style="padding:9px 0;font-family:${SANS};font-size:14px;color:${CREAM};word-break:break-word;">${esc(v)}</td>
</tr>`,
    )
    .join("");
  const inner = `
${label("NEW APPLICATION")}
${h1(esc(app.email))}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #4a4d54;margin-top:4px;">
${table}
</table>`;
  return {
    subject: `New Straitly application — ${app.email} (${app.spend})`,
    html: layout(inner, `${app.email} · ${app.spend} · ${app.country}`),
  };
}

/* ---------- server ---------- */

const isEmail = (v) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

async function sendEmail(to, subject, html, replyTo) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) console.error(`resend ${res.status}: ${await res.text()}`);
  return res.ok;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "straitly-mailer" }));
    return;
  }
  if (req.method !== "POST" || req.url !== "/apply") {
    res.writeHead(404).end();
    return;
  }

  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 10_000) req.destroy();
  });
  req.on("end", async () => {
    try {
      const b = JSON.parse(raw);
      if (!isEmail(b.email)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false }));
        return;
      }
      const app = {
        email: b.email,
        spend: typeof b.spend === "string" ? b.spend.slice(0, 100) : "",
        providers: Array.isArray(b.providers)
          ? b.providers.filter((x) => typeof x === "string").slice(0, 10)
          : [],
        models: typeof b.models === "string" ? b.models.slice(0, 500) : "",
        company: typeof b.company === "string" ? b.company.slice(0, 300) : "",
        country: typeof b.country === "string" ? b.country.slice(0, 100) : "",
      };
      const confirmation = applicationReceivedEmail();
      const alert = internalAlertEmail(app);
      const [a, c] = await Promise.all([
        sendEmail(app.email, confirmation.subject, confirmation.html),
        sendEmail(ALERT_TO, alert.subject, alert.html, app.email),
      ]);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: a && c }));
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false }));
    }
  });
});

server.listen(PORT, () => console.log(`straitly-mailer on :${PORT}`));

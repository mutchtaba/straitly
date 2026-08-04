/* Straitly transactional email templates.
   Table-based HTML so every client (Gmail, Outlook, Apple Mail) renders
   them identically. Brand: cream page, charcoal card, terracotta/amber
   accents, monospace labels to echo the site's pixel look. */

const CREAM = "#e8e3d8";
const CHARCOAL = "#2f3136";
const CHARCOAL_DEEP = "#26282c";
const TERRACOTTA = "#c8734f";
const AMBER = "#e8a33d";
const BODY_GRAY = "#c4beb4";
const MUTED = "#8d9098";

const MONO =
  "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function layout(inner: string, preheader: string): string {
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
  <p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:0.14em;color:#a29b8e;">
    STRAITLY &middot; QUALIFIED RATES ON FRONTIER MODELS
  </p>
  <p style="margin:6px 0 0;font-family:${SANS};font-size:12px;color:#a29b8e;">
    You're receiving this because you applied at straitly.ai.
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function label(text: string): string {
  return `<p style="margin:0 0 10px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;color:${AMBER};">${text}</p>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 18px;font-family:${SANS};font-size:26px;line-height:1.25;font-weight:700;color:${CREAM};">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${BODY_GRAY};">${text}</p>`;
}

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type Application = {
  email: string;
  spend: string;
  providers: string[];
  models: string;
  company: string;
  country: string;
};

/* ---------- 1. to the applicant: confirmation ---------- */

export function applicationReceivedEmail(): {
  subject: string;
  html: string;
} {
  const inner = `
${label("APPLICATION RECEIVED")}
${h1("You're in the queue.")}
${p("Thanks for applying to the Straitly qualification program. Our team reviews applications on a rolling basis &mdash; current review time is <strong style=\"color:" + CREAM + ";\">1&ndash;2 hours</strong>.")}
${p("If you qualify, your next email includes your API key and <strong style=\"color:" + CREAM + ";\">$100 in trial credits</strong> at your qualified rates. Getting started is one line: swap your base URL, drop in the key, send requests.")}
${p("No sales call. No commitment. Nothing to cancel.")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
<tr><td style="border-left:3px solid ${TERRACOTTA};padding:10px 16px;background-color:${CHARCOAL_DEEP};">
  <p style="margin:0;font-family:${MONO};font-size:12px;line-height:1.7;color:${MUTED};">
    WHAT HAPPENS NEXT<br/>
    <span style="color:${BODY_GRAY};">1. We check your usage against current program capacity.<br/>
    2. Approved? Key + credits arrive in your inbox.<br/>
    3. You're on program rates the same day.</span>
  </p>
</td></tr>
</table>`;
  return {
    subject: "Application received — Straitly",
    html: layout(inner, "We got your application. Review takes 1-2 hours."),
  };
}

/* ---------- 2. internal alert with all answers ---------- */

export function internalAlertEmail(app: Application): {
  subject: string;
  html: string;
} {
  const rows: [string, string][] = [
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

/* ---------- 3. approval: API key + credits (sent manually) ---------- */

export function approvalEmail(apiKey: string): {
  subject: string;
  html: string;
} {
  const inner = `
${label("QUALIFIED")}
${h1("You're approved. Here's your key.")}
${p("Welcome to the Straitly qualification program. Your account is live with <strong style=\"color:" + CREAM + ";\">$100 in trial credits</strong> at your qualified rates.")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;">
<tr><td style="background-color:${CHARCOAL_DEEP};border:1px solid #4a4d54;padding:16px 18px;">
  <p style="margin:0 0 6px;font-family:${MONO};font-size:10px;letter-spacing:0.24em;color:${MUTED};">YOUR API KEY</p>
  <p style="margin:0;font-family:${MONO};font-size:14px;color:${AMBER};word-break:break-all;">${esc(apiKey)}</p>
</td></tr>
</table>
${p("Getting started is one line &mdash; point your OpenAI-compatible client at us:")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr><td style="background-color:${CHARCOAL_DEEP};border:1px solid #4a4d54;padding:16px 18px;">
  <p style="margin:0;font-family:${MONO};font-size:13px;line-height:1.8;color:${BODY_GRAY};">
    base_url = <span style="color:${CREAM};">"https://api.straitly.ai/v1"</span><br/>
    api_key&nbsp;&nbsp;= <span style="color:${CREAM};">"&lt;your key above&gt;"</span>
  </p>
</td></tr>
</table>
${p("Every model in the catalog works through this one key. Reply to this email any time &mdash; a founder reads every message.")}`;
  return {
    subject: "You're approved — your Straitly API key inside",
    html: layout(inner, "Your API key and $100 in trial credits are live."),
  };
}

/* ---------- 4. decline: polite, leaves the door open ---------- */

export function declineEmail(): { subject: string; html: string } {
  const inner = `
${label("APPLICATION UPDATE")}
${h1("Not this round.")}
${p("Thanks for applying to the Straitly qualification program. Based on current program capacity we can't offer qualified rates for your usage profile right now.")}
${p("This isn't permanent &mdash; capacity opens up as we add providers, and usage profiles change. Reapply any time your monthly spend grows, or reply to this email if you think we misread your application. A founder reads every message.")}`;
  return {
    subject: "Your Straitly application — an update",
    html: layout(inner, "An update on your Straitly application."),
  };
}

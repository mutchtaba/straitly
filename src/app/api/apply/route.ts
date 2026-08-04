import { NextResponse } from "next/server";
import {
  applicationReceivedEmail,
  internalAlertEmail,
  type Application,
} from "@/lib/emails";

/* Qualification form intake. Sends two emails through Resend:
   1. confirmation to the applicant
   2. internal alert with every answer (this is the applicant database
      until there's a real console) */

const RESEND_URL = "https://api.resend.com/emails";
const FROM = process.env.EMAIL_FROM ?? "Straitly <team@straitly.ai>";
const ALERT_TO = process.env.ALERT_TO ?? "hashims@xynth.finance";

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<boolean> {
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
  if (!res.ok) {
    console.error(`resend ${res.status}: ${await res.text()}`);
  }
  return res.ok;
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (!isEmail(b.email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const app: Application = {
    email: b.email,
    spend: typeof b.spend === "string" ? b.spend.slice(0, 100) : "",
    providers: Array.isArray(b.providers)
      ? b.providers.filter((x): x is string => typeof x === "string").slice(0, 10)
      : [],
    models: typeof b.models === "string" ? b.models.slice(0, 500) : "",
    company: typeof b.company === "string" ? b.company.slice(0, 300) : "",
    country: typeof b.country === "string" ? b.country.slice(0, 100) : "",
  };

  const confirmation = applicationReceivedEmail();
  const alert = internalAlertEmail(app);

  const [sentConfirmation, sentAlert] = await Promise.all([
    sendEmail(apiKey, app.email, confirmation.subject, confirmation.html),
    sendEmail(apiKey, ALERT_TO, alert.subject, alert.html, app.email),
  ]);

  return NextResponse.json({ ok: sentConfirmation && sentAlert });
}

/* White-glove approval / decline sender. Run from straitly/:

   RESEND_API_KEY=re_xxx npx tsx scripts/send-approval.ts approve someone@co.com sk-straitly-abc123
   RESEND_API_KEY=re_xxx npx tsx scripts/send-approval.ts decline someone@co.com
*/
import { approvalEmail, declineEmail } from "../src/lib/emails";

const FROM = process.env.EMAIL_FROM ?? "Straitly <team@straitly.ai>";

async function main() {
  const [mode, to, apiKeyForUser] = process.argv.slice(2);
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("Set RESEND_API_KEY");
  if (mode !== "approve" && mode !== "decline")
    throw new Error("First arg must be approve|decline");
  if (!to) throw new Error("Second arg must be the recipient email");
  if (mode === "approve" && !apiKeyForUser)
    throw new Error("approve needs the user's API key as third arg");

  const email =
    mode === "approve" ? approvalEmail(apiKeyForUser) : declineEmail();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: email.subject,
      html: email.html,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
  console.log(`${mode} email sent to ${to} — id ${data.id}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

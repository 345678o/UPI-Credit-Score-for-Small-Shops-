import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[EmailAPI] RESEND_API_KEY is missing. Skipping email send.");
      return NextResponse.json(
        { error: "Email service not configured (missing API key)" },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);
    const { to, subject, body, template } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    const htmlBody = buildHtmlEmail(subject, body, template);

    const { data, error } = await resend.emails.send({
      from: "CrediPay <onboarding@resend.dev>", // Free Resend sandbox sender
      to: [to],
      subject,
      html: htmlBody,
    });

    if (error) {
      console.error("[EmailAPI] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: any) {
    console.error("[EmailAPI] Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildHtmlEmail(
  subject: string,
  body: string,
  template?: string
): string {
  const accentColor =
    template === "security"
      ? "#ef4444"
      : template === "reward"
      ? "#a78bfa"
      : "#10b981";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:24px;border:1px solid #1f1f1f;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${accentColor},#6366f1);"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td style="padding:40px 48px 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${accentColor};border-radius:16px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="color:#000;font-size:22px;font-weight:900;line-height:48px;">₹</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="color:#fff;font-size:18px;font-weight:900;letter-spacing:-0.5px;">CrediPay</span>
                    <br/>
                    <span style="color:#555;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Merchant Intelligence</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Subject -->
          <tr>
            <td style="padding:0 48px 16px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;line-height:1.3;">${subject}</h1>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <div style="height:1px;background:#1f1f1f;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 48px;">
              <p style="margin:0;color:#a1a1aa;font-size:15px;line-height:1.7;font-weight:500;">${body}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 40px;">
              <div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:14px;padding:16px 20px;">
                <p style="margin:0;color:#3f3f46;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                  🔒 AES-256 Encrypted · PCI Compliant · HDFC Gateway Secured
                </p>
              </div>
            </td>
          </tr>
        </table>
        <p style="color:#3f3f46;font-size:11px;margin-top:24px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
          © 2025 CrediPay · UPI Credit Infrastructure
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

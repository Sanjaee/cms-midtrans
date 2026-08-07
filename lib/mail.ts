import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

async function getTransporter() {
  const s = await getSettings();
  const host = s.smtpHost || process.env.SMTP_HOST || "";
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(s.smtpPort || process.env.SMTP_PORT || 587),
    secure: (s.smtpSecure || process.env.SMTP_SECURE) === "true",
    auth:
      (s.smtpUser || process.env.SMTP_USER) && (s.smtpPass || process.env.SMTP_PASS)
        ? {
            user: s.smtpUser || process.env.SMTP_USER || "",
            pass: s.smtpPass || process.env.SMTP_PASS || "",
          }
        : undefined,
  });
}

export async function sendMail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const transporter = await getTransporter();
  if (!transporter) {
    console.log(`[mail:disabled] to=${to} subject=${subject}`);
    return false;
  }
  try {
    const s = await getSettings();
    await transporter.sendMail({
      from: s.smtpFrom || process.env.SMTP_FROM || "Nova Store <noreply@nova.store>",
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("mail error", err);
    return false;
  }
}

export function layoutEmail(
  title: string,
  body: string,
  cta?: { label: string; url: string },
) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e7e5e4;">
<tr><td style="padding:32px 40px 8px;background:linear-gradient(120deg,#f59e0b,#f43f5e);">
<h1 style="margin:0;color:#fff;font-size:20px;">${title}</h1>
</td></tr>
<tr><td style="padding:32px 40px;color:#292524;font-size:15px;line-height:1.6;">
${body}
${
  cta
    ? `<p style="margin:24px 0 0;"><a href="${cta.url}" style="display:inline-block;background:linear-gradient(120deg,#f59e0b,#f43f5e);color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;">${cta.label}</a></p>`
    : ""
}
</td></tr>
<tr><td style="padding:20px 40px;background:#fafaf9;color:#a8a29e;font-size:12px;border-top:1px solid #f5f5f4;">
Jika tombol tidak berfungsi, salin tautan ini ke browser Anda.<br/>— Nova Store
</td></tr>
</table></td></tr></table>
</body>
</html>`;
}

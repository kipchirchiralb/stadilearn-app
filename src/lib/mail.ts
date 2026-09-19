import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { appDb } from "@/lib/db";

type Mail = { to: string; subject: string; text: string; html?: string };

const globalMail = globalThis as unknown as { __stadilearnMailer?: Transporter | null };

function envTrim(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return "";
  return value.replace(/^['"]|['"]$/g, "");
}

function getTransporter() {
  if (globalMail.__stadilearnMailer !== undefined) return globalMail.__stadilearnMailer;
  const host = envTrim("SMTP_HOST");
  if (!host) {
    globalMail.__stadilearnMailer = null;
    return null;
  }
  const port = Number(envTrim("SMTP_PORT") || "587") || 587;
  const user = envTrim("SMTP_USER");
  globalMail.__stadilearnMailer = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: user ? { user, pass: process.env.SMTP_PASSWORD ?? "" } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return globalMail.__stadilearnMailer;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? "");
}

export async function sendMail({ to, subject, text, html }: Mail) {
  const from = envTrim("MAIL_FROM") || envTrim("SMTP_USER");
  const transporter = getTransporter();
  if (!transporter || !from) {
    const err = new Error("SMTP is not configured");
    (err as Error & { code?: string }).code = "SMTP_UNCONFIGURED";
    throw err;
  }
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: html ?? `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>`,
  });
  return info.messageId ?? null;
}

const OTP_FALLBACK: Record<"en" | "sw", { subject: string; body: string }> = {
  en: {
    subject: "Your Stadilearn code",
    body: "Your Stadilearn code is {{code}}. It expires in {{minutes}} minutes. If you did not request it, ignore this email.",
  },
  sw: {
    subject: "Nambari yako ya Stadilearn",
    body: "Nambari yako ya Stadilearn ni {{code}}. Itaisha baada ya dakika {{minutes}}. Kama hukuiomba, puuza barua pepe hii.",
  },
};

async function otpTemplate(language: "en" | "sw") {
  try {
    const rows = await appDb.query<{ subject: string | null; body: string }>(
      `SELECT subject, body FROM notification_templates
       WHERE code = 'otp_code' AND channel = 'email' AND language IN (?, 'en')
       ORDER BY language = ? DESC LIMIT 1`,
      [language, language],
    );
    if (rows[0]?.body) {
      return { subject: rows[0].subject || OTP_FALLBACK[language].subject, body: rows[0].body };
    }
  } catch (err) {
    console.error("[mail] failed to load otp_code template", err);
  }
  return OTP_FALLBACK[language];
}

function otpHtml(text: string, code: string, minutes: string) {
  const body = escapeHtml(text).replace(/\n/g, "<br/>");
  return `<!DOCTYPE html>
<html lang="en"><body style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#1b1c1c;background:#f7f9fb;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;border:1px solid #e0e3e5;">
    <p style="margin:0 0 16px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#006680;font-weight:700;">Stadilearn</p>
    <p style="margin:0 0 20px;font-size:16px;">${body}</p>
    <p style="margin:0 0 20px;font-size:32px;letter-spacing:0.35em;font-weight:700;text-align:center;">${escapeHtml(code)}</p>
    <p style="margin:0;font-size:13px;color:#5d5f60;">This code expires in ${escapeHtml(minutes)} minutes. If you did not request it, you can ignore this email.</p>
  </div>
</body></html>`;
}

export async function sendOtpEmail(opts: {
  to: string;
  code: string;
  minutes: number;
  language: "en" | "sw";
  userId?: number | null;
  otpId: number;
}) {
  const minutes = String(opts.minutes);
  const tpl = await otpTemplate(opts.language);
  const vars = { code: opts.code, minutes };
  const text = renderTemplate(tpl.body, vars);
  const subject = renderTemplate(tpl.subject, vars);
  const domain = opts.to.includes("@") ? opts.to.split("@")[1] : "";
  const dedupe = `otp:${opts.otpId}`;

  try {
    const messageId = await sendMail({
      to: opts.to,
      subject,
      text,
      html: otpHtml(text, opts.code, minutes),
    });
    await appDb.execute(
      `INSERT INTO notification_jobs
         (user_id, channel, recipient, template_code, payload, dedupe_key, status, attempts, provider_message_id, sent_at)
       VALUES (?, 'email', ?, 'otp_code', ?, ?, 'sent', 1, ?, UTC_TIMESTAMP(3))`,
      [
        opts.userId ?? null,
        opts.to,
        JSON.stringify({ minutes: opts.minutes }),
        dedupe,
        messageId,
      ],
    ).catch((err) => console.error("[mail] failed to record sent OTP job", err));
    console.info("[mail] OTP email sent", { domain, otpId: opts.otpId });
  } catch (err) {
    const message = err instanceof Error ? err.message.slice(0, 500) : "send failed";
    console.error("[mail] OTP email failed", { domain, otpId: opts.otpId, message });
    await appDb.execute(
      `INSERT INTO notification_jobs
         (user_id, channel, recipient, template_code, payload, dedupe_key, status, attempts, last_error)
       VALUES (?, 'email', ?, 'otp_code', ?, ?, 'failed', 1, ?)`,
      [opts.userId ?? null, opts.to, JSON.stringify({ minutes: opts.minutes }), dedupe, message],
    ).catch(() => undefined);
    if (process.env.NODE_ENV !== "production") {
      console.info(`[otp] development code for ${opts.to}: ${opts.code}`);
    }
    throw err;
  }
}

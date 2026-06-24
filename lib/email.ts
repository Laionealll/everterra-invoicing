// Email sending is deferred until RESEND_API_KEY + EMAIL_FROM are configured.
// Every function degrades gracefully: if the key is missing we log instead of
// throwing, so invoice "send" and password-reset flows still work end-to-end.

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

type SendArgs = {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: Buffer }[]
}

async function send({ to, subject, html, attachments }: SendArgs): Promise<{ sent: boolean }> {
  if (!emailConfigured()) {
    console.log("[everterra] Email not configured. Would send:", { to, subject })
    return { sent: false }
  }
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject,
    html,
    attachments: attachments?.map((a) => ({ filename: a.filename, content: a.content })),
  })
  return { sent: true }
}

export async function sendPasswordResetEmail({
  to,
  name,
  url,
}: {
  to: string
  name: string
  url: string
}) {
  return send({
    to,
    subject: "Reset your Everterra password",
    html: `<p>Hi ${name || "there"},</p><p>Click below to reset your password:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  })
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  total,
  pdf,
}: {
  to: string
  invoiceNumber: string
  total: string
  pdf?: Buffer
}) {
  return send({
    to,
    subject: `Invoice ${invoiceNumber} from Everterra LLC`,
    html: `<p>Please find attached invoice <strong>${invoiceNumber}</strong> for <strong>${total}</strong>.</p><p>Thank you for your business.</p><p>Everterra LLC</p>`,
    attachments: pdf ? [{ filename: `${invoiceNumber}.pdf`, content: pdf }] : undefined,
  })
}

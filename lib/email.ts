// Email sending is deferred until RESEND_API_KEY + EMAIL_FROM are configured.
// Every function degrades gracefully: if the key is missing we log instead of
// throwing, so invoice "send" and password-reset flows still work end-to-end.
//
// Los correos van dirigidos a clientes, por eso el contenido va en inglés
// (igual que las facturas). El diseño usa tablas + estilos en línea para
// máxima compatibilidad con Gmail, Outlook, Apple Mail, etc.

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

// Paleta de marca (coincide con la factura).
const GREEN = "#3f7a4f"
const GREEN_SOFT = "#7aa86f"
const INK = "#1f2a22"
const MUTED = "#6b756c"
const BORDER = "#e2e8e0"
const PANEL = "#f5f8f3"

function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Envoltura con cabecera de marca y pie, compartida por todos los correos.
function brandedEmail({
  legalName,
  tagline,
  address,
  contentHtml,
}: {
  legalName: string
  tagline?: string
  address?: string
  contentHtml: string
}): string {
  const name = escapeHtml(legalName)
  const sub = tagline ? escapeHtml(tagline) : ""
  const addr = address ? escapeHtml(address) : ""
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0; padding:0; background:#eef2ec;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ec; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%; font-family: Arial, Helvetica, sans-serif; color:${INK};">
          <tr>
            <td style="background:${GREEN}; padding:22px 28px; border-radius:8px 8px 0 0;">
              <div style="color:#ffffff; font-size:20px; font-weight:bold; letter-spacing:1px;">${name.toUpperCase()}</div>
              ${sub ? `<div style="color:#cfe0c9; font-size:11px; letter-spacing:2px; margin-top:5px; text-transform:uppercase;">${sub}</div>` : ""}
            </td>
          </tr>
          <tr><td style="height:4px; background:${GREEN_SOFT}; font-size:0; line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="background:#ffffff; border:1px solid ${BORDER}; border-top:0; border-radius:0 0 8px 8px; padding:28px;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 8px 0; text-align:center; color:${MUTED}; font-size:11px; line-height:1.6; font-family: Arial, Helvetica, sans-serif;">
              ${name}${addr ? ` &middot; ${addr}` : ""}<br>
              This is an automated message. Please do not mark it as junk so future invoices reach your inbox.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

type SendArgs = {
  to: string
  subject: string
  html: string
  // Versión en texto plano. Enviar HTML + texto (multipart) mejora la
  // entregabilidad: los filtros de spam penalizan los correos solo-HTML.
  text?: string
  replyTo?: string
  attachments?: { filename: string; content: Buffer }[]
}

async function send({ to, subject, html, text, replyTo, attachments }: SendArgs): Promise<{ sent: boolean }> {
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
    text,
    replyTo,
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
  const safeName = escapeHtml(name || "there")
  const safeUrl = escapeHtml(url)
  const content = `
    <p style="font-size:15px; margin:0 0 16px;">Hi ${safeName},</p>
    <p style="font-size:14px; line-height:1.6; color:${INK}; margin:0 0 20px;">
      We received a request to reset the password for your Everterra invoicing account.
      Click the button below to choose a new password.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="background:${GREEN}; border-radius:6px;">
          <a href="${safeUrl}" style="display:inline-block; padding:12px 24px; color:#ffffff; font-size:14px; font-weight:bold; text-decoration:none;">Reset password</a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px; line-height:1.6; color:${MUTED}; margin:0 0 6px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size:12px; line-height:1.6; word-break:break-all; margin:0 0 20px;">
      <a href="${safeUrl}" style="color:${GREEN};">${safeUrl}</a>
    </p>
    <p style="font-size:13px; line-height:1.6; color:${MUTED}; margin:0;">
      If you didn't request this, you can safely ignore this email and your password will remain unchanged.
    </p>`
  const text = `Hi ${name || "there"},

We received a request to reset the password for your Everterra invoicing account.
Open the link below to choose a new password:

${url}

If you didn't request this, you can safely ignore this email and your password will remain unchanged.

Everterra LLC`

  return send({
    to,
    subject: "Reset your Everterra password",
    html: brandedEmail({ legalName: "Everterra LLC", tagline: "Invoicing Portal", contentHtml: content }),
    text,
  })
}

export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  total,
  dueDate,
  pdf,
  replyTo,
  company,
}: {
  to: string
  clientName?: string
  invoiceNumber: string
  total: string
  dueDate?: string
  pdf?: Buffer
  replyTo?: string
  company?: {
    legalName?: string
    tagline?: string
    phone?: string
    email?: string
    registeredAddress?: string
    acceptedMethods?: string
    zelleEmail?: string
  }
}) {
  const legalName = company?.legalName || "Everterra LLC"
  const greetingName = clientName ? escapeHtml(clientName) : "Valued Customer"
  const number = escapeHtml(invoiceNumber)
  const amount = escapeHtml(total)
  const paymentBits = [company?.acceptedMethods, company?.zelleEmail ? `Zelle: ${company.zelleEmail}` : ""]
    .filter(Boolean)
    .map((s) => escapeHtml(String(s)))
    .join(" &middot; ")

  const summaryRow = (label: string, value: string, opts?: { strong?: boolean; top?: boolean }) => `
    <tr>
      <td style="padding:11px 16px; font-size:13px; color:${MUTED}; ${opts?.top ? `border-top:1px solid ${BORDER};` : ""}">${label}</td>
      <td style="padding:11px 16px; font-size:${opts?.strong ? "16px" : "13px"}; text-align:right; font-weight:bold; color:${opts?.strong ? GREEN : INK}; ${opts?.top ? `border-top:1px solid ${BORDER};` : ""}">${value}</td>
    </tr>`

  const content = `
    <p style="font-size:15px; margin:0 0 16px;">Dear ${greetingName},</p>
    <p style="font-size:14px; line-height:1.6; color:${INK}; margin:0 0 22px;">
      Thank you for your business. Please find invoice <strong>${number}</strong> attached to this email as a PDF.
      A summary is shown below for your reference.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER}; border-radius:8px; background:${PANEL}; margin:0 0 22px;">
      ${summaryRow("Invoice", number)}
      ${dueDate ? summaryRow("Due date", escapeHtml(dueDate)) : ""}
      ${summaryRow("Amount due", amount, { strong: true, top: true })}
    </table>
    ${
      paymentBits
        ? `<p style="font-size:14px; line-height:1.6; color:${INK}; margin:0 0 18px;"><strong>Payment:</strong> ${paymentBits}</p>`
        : ""
    }
    <p style="font-size:14px; line-height:1.6; color:${INK}; margin:0 0 22px;">
      If you have any questions about this invoice, simply reply to this email and our team will be glad to assist.
    </p>
    <p style="font-size:14px; color:${INK}; margin:0;">Best regards,</p>
    <p style="font-size:14px; font-weight:bold; color:${INK}; margin:3px 0 0;">${escapeHtml(legalName)}</p>
    ${
      company?.phone || company?.email
        ? `<p style="font-size:12px; color:${MUTED}; margin:3px 0 0;">${[company?.phone, company?.email].filter(Boolean).map((s) => escapeHtml(String(s))).join(" &middot; ")}</p>`
        : ""
    }`

  const textLines = [
    `Dear ${clientName || "Valued Customer"},`,
    "",
    `Thank you for your business. Please find invoice ${invoiceNumber} attached to this email as a PDF.`,
    "",
    `Invoice: ${invoiceNumber}`,
    dueDate ? `Due date: ${dueDate}` : "",
    `Amount due: ${total}`,
    "",
    company?.acceptedMethods ? `Payment: ${company.acceptedMethods}` : "",
    company?.zelleEmail ? `Zelle: ${company.zelleEmail}` : "",
    "",
    "If you have any questions about this invoice, simply reply to this email.",
    "",
    "Best regards,",
    legalName,
    [company?.phone, company?.email].filter(Boolean).join(" · "),
    company?.registeredAddress || "",
  ]
  const text = textLines.filter((line, i) => line !== "" || textLines[i - 1] !== "").join("\n")

  return send({
    to,
    replyTo,
    subject: `Invoice ${invoiceNumber} from ${legalName}`,
    html: brandedEmail({
      legalName,
      tagline: company?.tagline,
      address: company?.registeredAddress,
      contentHtml: content,
    }),
    text,
    attachments: pdf ? [{ filename: `${invoiceNumber}.pdf`, content: pdf }] : undefined,
  })
}

import { BrandLogo } from "@/components/brand-logo"
import { formatCurrency, formatDate } from "@/lib/format"

// NOTA: la factura SIEMPRE se muestra en inglés (va dirigida a los clientes),
// independientemente del idioma de la interfaz. No usar i18n aquí.

export type InvoiceDocItem = {
  product: string
  origin: string | null
  quality: string | null
  quantity: string
  qty: string
  unitPrice: string
  amount: string
}

export type InvoiceDocData = {
  invoiceNumber: string
  status: string
  issueDate: Date | string
  dueDate: Date | string
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
  notes: string
  paymentTerms: string
  signatoryName: string
  signatoryTitle: string
  receivedByName: string
  receivedByCompany: string
  items: InvoiceDocItem[]
}

export type InvoiceDocClient = {
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  zip: string
  country: string
} | null

export type InvoiceDocCompany = {
  legalName: string
  registeredAddress: string
  operations: string
  phone: string
  email: string
  tagline: string
  zelleEmail: string
  bankName: string
  accountNumber: string
  routingNumber: string
  acceptedMethods: string
}

export function InvoiceDocument({
  invoice,
  client,
  company,
}: {
  invoice: InvoiceDocData
  client: InvoiceDocClient
  company: InvoiceDocCompany
}) {
  const clientLines = client
    ? [
        client.addressLine1,
        client.addressLine2,
        [client.city, client.state, client.zip].filter(Boolean).join(", "),
        client.country,
      ].filter(Boolean)
    : []

  const showTax = Number(invoice.taxRate) > 0 || Number(invoice.taxAmount) > 0
  const receivedCompany = invoice.receivedByCompany || client?.name || ""

  return (
    <div className="mx-auto w-full max-w-3xl bg-card text-card-foreground">
      {/* Header band */}
      <div className="flex flex-col gap-4 bg-sidebar px-8 py-7 text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-md bg-card px-3 py-2">
          <BrandLogo variant="full" imgClassName="h-11" />
        </div>
        <div className="sm:text-right">
          <p className="font-serif text-3xl font-semibold tracking-tight">INVOICE</p>
          <p className="mt-1 text-sm text-sidebar-foreground/80">{invoice.invoiceNumber}</p>
        </div>
      </div>
      {/* Accent rule */}
      <div className="h-1 w-full bg-primary" />

      <div className="px-8 py-7">
        {/* Parties */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">From</p>
            <p className="font-semibold">{company.legalName}</p>
            <p className="text-sm text-muted-foreground">{company.registeredAddress}</p>
            <p className="text-sm text-muted-foreground">Ops: {company.operations}</p>
            <p className="text-sm text-muted-foreground">{company.phone}</p>
            <p className="text-sm text-muted-foreground">{company.email}</p>
          </div>
          <div className="flex flex-col gap-1 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Bill to</p>
            <p className="font-semibold">{client?.name ?? "—"}</p>
            {client?.contactName && (
              <p className="text-sm text-muted-foreground">Attn: {client.contactName}</p>
            )}
            {clientLines.map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {line}
              </p>
            ))}
            {client?.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          <div className="bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Issue date</p>
            <p className="text-sm font-medium">{formatDate(invoice.issueDate)}</p>
          </div>
          <div className="bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Due date</p>
            <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wide text-primary/80">Amount due</p>
            <p className="text-sm font-semibold text-primary">{formatCurrency(invoice.total)}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sidebar text-sidebar-foreground">
                <th className="px-3 py-2.5 text-left font-medium">Product</th>
                <th className="px-3 py-2.5 text-left font-medium">Details</th>
                <th className="px-3 py-2.5 text-right font-medium">Qty</th>
                <th className="px-3 py-2.5 text-right font-medium">Unit</th>
                <th className="px-3 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, i) => {
                const details = [
                  it.origin ? `Origin: ${it.origin}` : null,
                  it.quality ? `Quality: ${it.quality}` : null,
                  it.quantity ? `Pack: ${it.quantity}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
                return (
                  <tr
                    key={i}
                    className="border-t border-border align-top odd:bg-transparent even:bg-muted/30"
                  >
                    <td className="px-3 py-2.5 font-medium">{it.product}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{details || "—"}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{Number(it.qty)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {formatCurrency(it.unitPrice)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                      {formatCurrency(it.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs flex-col gap-2">
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {showTax && (
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-muted-foreground">Tax ({Number(invoice.taxRate)}%)</span>
                <span className="tabular-nums">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between rounded-md bg-primary px-3 py-2.5 text-base font-semibold text-primary-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment + notes */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Payment instructions
            </p>
            <p className="text-sm">Accepted: {company.acceptedMethods}</p>
            {company.zelleEmail && <p className="text-sm">Zelle: {company.zelleEmail}</p>}
            {company.bankName && <p className="text-sm">Bank: {company.bankName}</p>}
            {company.accountNumber && <p className="text-sm">Account: {company.accountNumber}</p>}
            {company.routingNumber && <p className="text-sm">Routing: {company.routingNumber}</p>}
            {invoice.paymentTerms && (
              <p className="mt-1 text-sm text-muted-foreground">{invoice.paymentTerms}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Notes &amp; terms
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">{invoice.notes}</p>
          </div>
        </div>

        {/* Signatures: authorized signature (left) + received by (right) */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div className="flex flex-col">
            <div className="h-10" />
            <div className="border-t border-foreground/70 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Authorized signature
              </p>
              <p className="mt-1 text-sm font-medium">{invoice.signatoryName}</p>
              <p className="text-xs text-muted-foreground">{invoice.signatoryTitle}</p>
              <p className="text-xs text-muted-foreground">{company.legalName}</p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="h-10" />
            <div className="border-t border-foreground/70 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Received by
              </p>
              <p className="mt-1 text-sm font-medium">{invoice.receivedByName || " "}</p>
              <p className="text-xs text-muted-foreground">
                Company: {receivedCompany || " "}
              </p>
              <p className="text-xs text-muted-foreground">Date: ______________________</p>
            </div>
          </div>
        </div>

        {/* End of document marker */}
        <div className="mt-12 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            End of Invoice
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {company.legalName} · {company.phone} · {company.email}
        </p>
      </div>
    </div>
  )
}

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import { formatCurrency, formatDate } from "@/lib/format"

// NOTA: el PDF de la factura SIEMPRE se genera en inglés (va dirigido a los
// clientes), independientemente del idioma de la interfaz. No usar i18n aquí.

const GREEN = "#2f5d3a"
const GREEN_LIGHT = "#7aa86f"
const PRIMARY = "#356b41"
const PRIMARY_SOFT = "#e8f0e6"
const INK = "#1f2a22"
const MUTED = "#6b756c"
const BORDER = "#dde3dc"
const SOFT = "#f3f6f1"
const ZEBRA = "#f8faf7"

const styles = StyleSheet.create({
  page: { paddingBottom: 56, fontSize: 9, color: INK, fontFamily: "Helvetica" },
  header: {
    backgroundColor: GREEN,
    color: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accent: { height: 3, backgroundColor: PRIMARY },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  tagline: { fontSize: 7, color: GREEN_LIGHT, marginTop: 3, letterSpacing: 1.5 },
  logoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  logoImg: { height: 34, objectFit: "contain" },
  invoiceTitle: { fontSize: 24, fontFamily: "Helvetica-Bold", textAlign: "right", letterSpacing: 1 },
  invoiceNo: { fontSize: 9, color: "#d7e3d4", textAlign: "right", marginTop: 3 },
  body: { paddingHorizontal: 32, paddingTop: 22 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { flexDirection: "column", width: "48%" },
  colRight: { flexDirection: "column", width: "48%", textAlign: "right" },
  label: {
    fontSize: 7,
    color: PRIMARY,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  mutedLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  strong: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 2 },
  line: { color: MUTED, marginBottom: 1 },
  meta: {
    marginTop: 18,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    overflow: "hidden",
  },
  metaCell: { flex: 1, padding: 10, backgroundColor: SOFT },
  metaCellDue: { flex: 1, padding: 10, backgroundColor: PRIMARY_SOFT },
  metaValue: { fontFamily: "Helvetica-Bold", marginTop: 2 },
  metaValueDue: { fontFamily: "Helvetica-Bold", marginTop: 2, color: PRIMARY },
  table: { marginTop: 18, borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" },
  th: {
    flexDirection: "row",
    backgroundColor: GREEN,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  trAlt: { backgroundColor: ZEBRA },
  cProduct: { width: "30%" },
  cDetails: { width: "34%", color: MUTED },
  cQty: { width: "10%", textAlign: "right" },
  cUnit: { width: "13%", textAlign: "right" },
  cAmount: { width: "13%", textAlign: "right" },
  thText: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#ffffff" },
  totals: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" },
  totalsBox: { width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  grand: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#ffffff" },
  panels: { marginTop: 22, flexDirection: "row", justifyContent: "space-between" },
  panel: {
    width: "48%",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    backgroundColor: SOFT,
    padding: 10,
  },
  notes: { width: "48%" },
  // Firmas
  signatures: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  sigCol: { width: "45%" },
  sigSpace: { height: 26 },
  sigBlock: { borderTopWidth: 1, borderTopColor: INK, paddingTop: 4 },
  sigLabel: {
    fontSize: 7,
    color: MUTED,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sigName: { fontFamily: "Helvetica-Bold", marginTop: 2 },
  sigMuted: { color: MUTED, marginTop: 1 },
  // Fin del documento
  endRow: {
    marginTop: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  endLine: { flex: 1, borderTopWidth: 1, borderTopColor: BORDER },
  endText: {
    fontSize: 7,
    color: MUTED,
    marginHorizontal: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  footer: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 7,
    color: MUTED,
    paddingHorizontal: 32,
  },
})

export type PdfPayload = {
  invoice: {
    invoiceNumber: string
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
    items: {
      product: string
      origin: string | null
      quality: string | null
      quantity: string
      qty: string
      unitPrice: string
      amount: string
    }[]
  }
  client: {
    name: string
    contactName: string | null
    email: string | null
    addressLine1: string
    addressLine2: string | null
    city: string
    state: string
    zip: string
    country: string
  } | null
  company: {
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
  logoData?: string | null
}

export function InvoicePdf({ invoice, client, company, logoData }: PdfPayload) {
  const showTax = Number(invoice.taxRate) > 0 || Number(invoice.taxAmount) > 0
  const receivedCompany = invoice.receivedByCompany || client?.name || ""
  const clientLines = client
    ? [
        client.addressLine1,
        client.addressLine2 || "",
        [client.city, client.state, client.zip].filter(Boolean).join(", "),
        client.country,
      ].filter(Boolean)
    : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoData ? (
            <View style={styles.logoBox}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={logoData} style={styles.logoImg} />
            </View>
          ) : (
            <View>
              <Text style={styles.brand}>{company.legalName.toUpperCase()}</Text>
              <Text style={styles.tagline}>{company.tagline}</Text>
            </View>
          )}
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNo}>{invoice.invoiceNumber}</Text>
          </View>
        </View>
        <View style={styles.accent} />

        <View style={styles.body}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>From</Text>
              <Text style={styles.strong}>{company.legalName}</Text>
              <Text style={styles.line}>{company.registeredAddress}</Text>
              <Text style={styles.line}>Ops: {company.operations}</Text>
              <Text style={styles.line}>{company.phone}</Text>
              <Text style={styles.line}>{company.email}</Text>
            </View>
            <View style={styles.colRight}>
              <Text style={styles.label}>Bill To</Text>
              <Text style={styles.strong}>{client?.name ?? "-"}</Text>
              {client?.contactName ? (
                <Text style={styles.line}>Attn: {client.contactName}</Text>
              ) : null}
              {clientLines.map((l, i) => (
                <Text key={i} style={styles.line}>
                  {l}
                </Text>
              ))}
              {client?.email ? <Text style={styles.line}>{client.email}</Text> : null}
            </View>
          </View>

          <View style={styles.meta}>
            <View style={styles.metaCell}>
              <Text style={styles.mutedLabel}>Issue Date</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.mutedLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.metaCellDue}>
              <Text style={[styles.mutedLabel, { color: PRIMARY }]}>Amount Due</Text>
              <Text style={styles.metaValueDue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.th}>
              <Text style={[styles.cProduct, styles.thText]}>Product</Text>
              <Text style={[styles.cDetails, styles.thText]}>Details</Text>
              <Text style={[styles.cQty, styles.thText]}>Qty</Text>
              <Text style={[styles.cUnit, styles.thText]}>Unit</Text>
              <Text style={[styles.cAmount, styles.thText]}>Amount</Text>
            </View>
            {invoice.items.map((it, i) => {
              const details = [
                it.origin ? `Origin: ${it.origin}` : "",
                it.quality ? `Quality: ${it.quality}` : "",
                it.quantity ? `Pack: ${it.quantity}` : "",
              ]
                .filter(Boolean)
                .join("  ")
              return (
                <View key={i} style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]}>
                  <Text style={styles.cProduct}>{it.product}</Text>
                  <Text style={styles.cDetails}>{details || "-"}</Text>
                  <Text style={styles.cQty}>{Number(it.qty)}</Text>
                  <Text style={styles.cUnit}>{formatCurrency(it.unitPrice)}</Text>
                  <Text style={styles.cAmount}>{formatCurrency(it.amount)}</Text>
                </View>
              )
            })}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={{ color: MUTED }}>Subtotal</Text>
                <Text>{formatCurrency(invoice.subtotal)}</Text>
              </View>
              {showTax ? (
                <View style={styles.totalRow}>
                  <Text style={{ color: MUTED }}>Tax ({Number(invoice.taxRate)}%)</Text>
                  <Text>{formatCurrency(invoice.taxAmount)}</Text>
                </View>
              ) : null}
              <View style={styles.grandRow}>
                <Text style={styles.grand}>Total</Text>
                <Text style={styles.grand}>{formatCurrency(invoice.total)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.panels}>
            <View style={styles.panel}>
              <Text style={styles.label}>Payment Instructions</Text>
              <Text style={styles.line}>Accepted: {company.acceptedMethods}</Text>
              {company.zelleEmail ? (
                <Text style={styles.line}>Zelle: {company.zelleEmail}</Text>
              ) : null}
              {company.bankName ? (
                <Text style={styles.line}>Bank: {company.bankName}</Text>
              ) : null}
              {company.accountNumber ? (
                <Text style={styles.line}>Account: {company.accountNumber}</Text>
              ) : null}
              {company.routingNumber ? (
                <Text style={styles.line}>Routing: {company.routingNumber}</Text>
              ) : null}
              {invoice.paymentTerms ? (
                <Text style={[styles.line, { marginTop: 4 }]}>{invoice.paymentTerms}</Text>
              ) : null}
            </View>
            <View style={styles.notes}>
              <Text style={styles.label}>Notes & Terms</Text>
              <Text style={[styles.line, { lineHeight: 1.4 }]}>{invoice.notes}</Text>
            </View>
          </View>
        </View>

        {/* Firmas: firma autorizada (izquierda) + recibido por (derecha) */}
        <View style={styles.signatures}>
          <View style={styles.sigCol}>
            <View style={styles.sigSpace} />
            <View style={styles.sigBlock}>
              <Text style={styles.sigLabel}>Authorized Signature</Text>
              <Text style={styles.sigName}>{invoice.signatoryName}</Text>
              <Text style={styles.sigMuted}>{invoice.signatoryTitle}</Text>
              <Text style={styles.sigMuted}>{company.legalName}</Text>
            </View>
          </View>
          <View style={styles.sigCol}>
            <View style={styles.sigSpace} />
            <View style={styles.sigBlock}>
              <Text style={styles.sigLabel}>Received By</Text>
              <Text style={styles.sigName}>{invoice.receivedByName || " "}</Text>
              <Text style={styles.sigMuted}>Company: {receivedCompany || " "}</Text>
              <Text style={styles.sigMuted}>Date: ______________________</Text>
            </View>
          </View>
        </View>

        {/* Marca de fin de documento */}
        <View style={styles.endRow}>
          <View style={styles.endLine} />
          <Text style={styles.endText}>End of Invoice</Text>
          <View style={styles.endLine} />
        </View>
        <Text style={styles.footer}>
          {company.legalName} · {company.phone} · {company.email}
        </Text>
      </Page>
    </Document>
  )
}

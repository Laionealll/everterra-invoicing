import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import { formatCurrency, formatDate } from "@/lib/format"

const GREEN = "#2f5d3a"
const GREEN_LIGHT = "#7aa86f"
const INK = "#1f2a22"
const MUTED = "#6b756c"
const BORDER = "#dde3dc"
const SOFT = "#f3f6f1"

const styles = StyleSheet.create({
  page: { paddingBottom: 48, fontSize: 9, color: INK, fontFamily: "Helvetica" },
  header: {
    backgroundColor: GREEN,
    color: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  tagline: { fontSize: 7, color: GREEN_LIGHT, marginTop: 3, letterSpacing: 1.5 },
  logoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  logoImg: { height: 34, objectFit: "contain" },
  invoiceTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", textAlign: "right" },
  invoiceNo: { fontSize: 9, color: "#d7e3d4", textAlign: "right", marginTop: 2 },
  body: { paddingHorizontal: 32, paddingTop: 22 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { flexDirection: "column", width: "48%" },
  label: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  strong: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 2 },
  line: { color: MUTED, marginBottom: 1 },
  meta: {
    marginTop: 18,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    backgroundColor: SOFT,
    padding: 10,
  },
  metaCell: { flex: 1 },
  metaValue: { fontFamily: "Helvetica-Bold", marginTop: 2 },
  table: { marginTop: 18, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  th: {
    flexDirection: "row",
    backgroundColor: SOFT,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  cProduct: { width: "30%" },
  cDetails: { width: "34%", color: MUTED },
  cQty: { width: "10%", textAlign: "right" },
  cUnit: { width: "13%", textAlign: "right" },
  cAmount: { width: "13%", textAlign: "right" },
  thText: { fontFamily: "Helvetica-Bold", fontSize: 8 },
  totals: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" },
  totalsBox: { width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  grand: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  panels: { marginTop: 20, flexDirection: "row", justifyContent: "space-between" },
  panel: {
    width: "48%",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 10,
  },
  notes: { width: "48%" },
  signature: { marginTop: 36, alignItems: "flex-end", paddingHorizontal: 32 },
  sigLine: { width: 150, borderTopWidth: 1, borderTopColor: INK, marginBottom: 3 },
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
            <View style={styles.col}>
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
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.label}>Amount Due</Text>
              <Text style={styles.metaValue}>{formatCurrency(invoice.total)}</Text>
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
                <View key={i} style={styles.tr}>
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

        <View style={styles.signature}>
          <View style={styles.sigLine} />
          <Text style={{ fontFamily: "Helvetica-Bold" }}>{invoice.signatoryName}</Text>
          <Text style={{ color: MUTED }}>{invoice.signatoryTitle}</Text>
          <Text style={{ color: MUTED }}>{company.legalName}</Text>
        </View>
      </Page>
    </Document>
  )
}

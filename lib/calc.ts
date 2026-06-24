export type LineItemInput = {
  product: string
  origin?: string
  quality?: string
  quantity: string
  qty: number
  unitPrice: number
}

export type InvoiceTotals = {
  subtotal: number
  taxAmount: number
  total: number
  lineAmounts: number[]
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function computeTotals(items: LineItemInput[], taxRate: number): InvoiceTotals {
  const lineAmounts = items.map((it) => round2((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)))
  const subtotal = round2(lineAmounts.reduce((sum, a) => sum + a, 0))
  const taxAmount = round2(subtotal * ((Number(taxRate) || 0) / 100))
  const total = round2(subtotal + taxAmount)
  return { subtotal, taxAmount, total, lineAmounts }
}

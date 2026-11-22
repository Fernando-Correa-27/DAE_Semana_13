const CURRENCY_FORMATTER = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats an API decimal string as Peruvian soles without losing cents. */
export function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  return CURRENCY_FORMATTER.format(amount)
}

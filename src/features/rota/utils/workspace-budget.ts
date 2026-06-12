const DEFAULT_HOURLY_RATE_GBP = 12.71

function getScheduledCostFromMinutes(
  totalMinutes: number,
  hourlyRate = DEFAULT_HOURLY_RATE_GBP
) {
  return (totalMinutes / 60) * hourlyRate
}

function formatCurrency(
  value: number,
  options: {
    currency?: string
    locale?: string
  } = {}
) {
  return new Intl.NumberFormat(options.locale ?? "en-GB", {
    style: "currency",
    currency: options.currency ?? "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export { DEFAULT_HOURLY_RATE_GBP, formatCurrency, getScheduledCostFromMinutes }

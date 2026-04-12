function formatHours(value: number) {
  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)}h`
}

function getStatusVariant(status: "draft" | "published") {
  return status === "published" ? "default" : "secondary"
}

export { formatHours, getStatusVariant }

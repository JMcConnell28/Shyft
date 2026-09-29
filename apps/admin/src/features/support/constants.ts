const supportCategoryLabels: Record<string, string> = {
  support: "Question",
  bug: "Issue",
  feature_request: "Suggestion",
}

function getSupportCategoryLabel(category: string): string {
  return supportCategoryLabels[category] ?? category
}

export { getSupportCategoryLabel }

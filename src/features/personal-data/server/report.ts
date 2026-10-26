import type { PersonalDataResponse } from "@rocketrota/shared/privacy"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
function renderPersonalDataReport(response: PersonalDataResponse): string {
  const label = (value: string) =>
    value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2")
  const paragraph = (value: string) =>
    `<p>${escapeHtml(value).replaceAll("\n", "<br>")}</p>`
  const processing = Object.entries(response.processing)
    .map(
      ([title, value]) =>
        `<h3>${escapeHtml(label(title))}</h3>${paragraph(value)}`
    )
    .join("")
  const sections = response.sections
    .map((section) => {
      const records = section.records
        .map(
          (record) =>
            `<dl>${Object.entries(record)
              .map(
                ([key, value]) =>
                  `<dt>${escapeHtml(label(key))}</dt><dd>${escapeHtml(value === null ? "Not recorded" : typeof value === "string" ? value : JSON.stringify(value))}</dd>`
              )
              .join("")}</dl>`
        )
        .join("")
      return `<section><h2>${escapeHtml(section.title)}</h2>${records || "<p>No records found in this section.</p>"}</section>`
    })
    .join("")
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>RocketRota personal data response</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:900px;margin:32px auto;padding:0 20px;color:#182132}h1,h2,h3{line-height:1.25}section{margin-top:32px}dl{border-top:1px solid #ccd3dc;padding-top:12px}dt{font-weight:600}dd{margin:0 0 8px;overflow-wrap:anywhere;white-space:pre-wrap}@media print{body{margin:0}dl{break-inside:avoid}}</style></head><body><h1>Your RocketRota personal data response</h1>${paragraph(response.subject.name)}${paragraph(response.subject.email)}${paragraph(`Request: ${response.requestId} · Prepared: ${response.generatedAt}`)}${paragraph(response.summary)}<h2>How your information is used</h2>${processing}<h2>Scope and disclosure notes</h2>${paragraph(response.scopeAndRedactions)}${sections}</body></html>`
}
export { escapeHtml, renderPersonalDataReport }

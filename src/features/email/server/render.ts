import "@tanstack/react-start/server-only"

import { renderToStaticMarkup } from "react-dom/server"
import type { ReactElement } from "react"

function renderEmailHtml(element: ReactElement): string {
  // Templates use inline styles and provide explicit plain text. Avoid pulling
  // an unused HTML-to-text converter into the production email path.
  const html = renderToStaticMarkup(element)
  return /^<!doctype/i.test(html) ? html : `<!DOCTYPE html>${html}`
}

export { renderEmailHtml }

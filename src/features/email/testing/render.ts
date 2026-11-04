import { JSDOM } from "jsdom"
import { vi } from "vitest"
import type { ReactElement } from "react"

import { renderEmailHtml } from "@/features/email/server/render"

vi.mock("@tanstack/react-start/server-only", () => ({}))

function render(element: ReactElement): Promise<string> {
  return Promise.resolve(renderEmailHtml(element))
}

function toPlainText(html: string): string {
  const dom = new JSDOM(html)
  const text = dom.window.document.body.textContent
  dom.window.close()
  return text
}

export { render, toPlainText }

import { renderToStaticMarkup } from "react-dom/server"
import { expect, it } from "vitest"
import { PersonalDataRequestCard } from "./personal-data-request-card"
import type { PrivacyRequestSummary } from "@rocketrota/shared/privacy"

const request: PrivacyRequestSummary = {
  id: "00000000-0000-4000-8000-000000000001",
  status: "in_review",
  requestedAt: "2026-10-26T12:00:00Z",
  dueAt: "2026-11-26T12:00:00Z",
  expiresAt: null,
  message: "We are reviewing your records.",
  revision: 1,
}
it("does not offer downloads before review and release", () => {
  const html = renderToStaticMarkup(
    <PersonalDataRequestCard request={request} />
  )
  expect(html).toContain("Being reviewed")
  expect(html).not.toContain("/api/personal-data/")
})
it("offers both readable and structured formats for an available response", () => {
  const html = renderToStaticMarkup(
    <PersonalDataRequestCard
      request={{
        ...request,
        status: "ready",
        expiresAt: "2099-01-01T00:00:00Z",
      }}
    />
  )
  expect(html).toContain("format=html")
  expect(html).toContain("format=json")
})
it("removes download links as soon as the expiry time passes", () => {
  const html = renderToStaticMarkup(
    <PersonalDataRequestCard
      request={{
        ...request,
        status: "ready",
        expiresAt: "2000-01-01T00:00:00Z",
      }}
    />
  )
  expect(html).toContain("Download expired")
  expect(html).not.toContain("/api/personal-data/")
})

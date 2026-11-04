import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { sendTransactionalEmail } from "./email"

const { request } = vi.hoisted(() => ({ request: vi.fn<typeof fetch>() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/env.server", () => ({
  getRequiredEnv: () => "synthetic-mail-key",
  getOptionalEnv: () => undefined,
}))
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("fetch", request)
  request.mockResolvedValue(
    Response.json({ id: "02c90bcd-5c36-4181-873e-d7fbcf988cb2" })
  )
})
afterEach(() => vi.unstubAllGlobals())

const message = {
  to: "synthetic@example.invalid",
  subject: "Fixture",
  react: <p>{'<script>alert("test")</script>'}</p>,
  text: "Explicit plain text fixture",
  idempotencyKey: "fixture/email",
}

describe("production email delivery", () => {
  it("sends escaped HTML, explicit plain text and the provider idempotency header", async () => {
    await sendTransactionalEmail(message)
    const [url, options] = request.mock.lastCall ?? []
    expect(url).toBe("https://api.resend.com/emails")
    const body = JSON.parse(String(options?.body))
    expect(body.html).toContain("&lt;script&gt;")
    expect(body.html).not.toContain("<script>")
    expect(body.react).toBeUndefined()
    expect(body.text).toBe(message.text)
    expect(new Headers(options?.headers).get("Idempotency-Key")).toBe(
      "fixture/email"
    )
    expect(options?.redirect).toBe("error")
    expect(options?.signal).toBeInstanceOf(AbortSignal)
  })
  it.each([
    Response.json({ message: "private provider error" }, { status: 422 }),
    Response.json({ error: "missing delivery identifier" }),
  ])(
    "rejects failed or malformed provider responses without disclosing their body",
    async (response) => {
      request.mockResolvedValue(response)
      await expect(sendTransactionalEmail(message)).rejects.toThrow(
        "Email delivery failed. Please try again."
      )
    }
  )
  it("handles a network timeout as a failed delivery", async () => {
    request.mockRejectedValue(
      new DOMException("private request detail", "TimeoutError")
    )
    await expect(sendTransactionalEmail(message)).rejects.toThrow(
      "Email delivery failed. Please try again."
    )
  })
})

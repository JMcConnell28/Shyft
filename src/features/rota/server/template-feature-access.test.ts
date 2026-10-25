import { beforeEach, expect, it, vi } from "vitest"
import {
  applyRotaTemplateToRota,
  createRotaTemplateFromRota,
  overrideRotaTemplateFromRota,
} from "./template-actions"

const { gate, connect } = vi.hoisted(() => ({
  gate: vi.fn(),
  connect: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validate = (input: unknown): unknown => input
    return {
      validator(fn: (input: unknown) => unknown) {
        validate = fn
        return this
      },
      handler(fn: (context: { data: unknown }) => unknown) {
        return (options: { data?: unknown } = {}) =>
          fn({ data: validate(options.data) })
      },
    }
  },
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ connect }) }))
vi.mock("@/features/feature-flags/server/evaluation", () => ({
  requireLocationFeature: gate,
}))
vi.mock("./write-access", () => ({
  requireRotaWriteAccess: () =>
    Promise.resolve({ location: { id: "location" } }),
}))
beforeEach(() => {
  vi.clearAllMocks()
  gate.mockRejectedValue(new Error("Templates unavailable"))
})
it("blocks template create, overwrite and apply even when called directly", async () => {
  const rotaId = "00000000-0000-4000-8000-000000000001",
    templateId = "00000000-0000-4000-8000-000000000002"
  await expect(
    createRotaTemplateFromRota({ data: { rotaId, name: "Example" } })
  ).rejects.toThrow("Templates unavailable")
  await expect(
    overrideRotaTemplateFromRota({ data: { rotaId, templateId } })
  ).rejects.toThrow("Templates unavailable")
  await expect(
    applyRotaTemplateToRota({ data: { rotaId, templateId } })
  ).rejects.toThrow("Templates unavailable")
  expect(gate).toHaveBeenCalledTimes(3)
  expect(connect).not.toHaveBeenCalled()
})

import { beforeEach, expect, it, vi } from "vitest"
import { getRequestShiftsOrThrow } from "./request-shifts"

const { shifts } = vi.hoisted(() => ({ shifts: vi.fn() }))
vi.mock("./shared", () => ({ listPublishedShiftRows: shifts }))
const scope = {
  canManage: false,
  locationIds: ["enabled-location"],
  organizationId: "org",
  userId: "user",
}
const request = {
  source_assignment_id: "source",
  target_assignment_id: "target",
}
beforeEach(() => vi.resetAllMocks())
it("rejects a request when either shift is outside the enabled location scope", async () => {
  shifts.mockResolvedValue([{ assignment_id: "source" }])
  await expect(getRequestShiftsOrThrow(scope, request)).rejects.toThrow(
    "valid current or future"
  )
  shifts.mockResolvedValue([{ assignment_id: "target" }])
  await expect(getRequestShiftsOrThrow(scope, request)).rejects.toThrow(
    "valid current or future"
  )
})
it("loads scoped shifts once and reuses them when responding to a request", async () => {
  const rows = [{ assignment_id: "source" }, { assignment_id: "target" }]
  shifts.mockResolvedValue(rows)
  expect(await getRequestShiftsOrThrow(scope, request)).toEqual({
    source: rows[0],
    target: rows[1],
  })
  expect(shifts).toHaveBeenCalledExactlyOnceWith(scope)
})

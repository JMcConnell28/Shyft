import { expect, it } from "vitest"
import { staffInviteSelectionSchema } from "./onboarding-schemas"

const location = "00000000-0000-4000-8000-000000000001"
const input = {
  organizationId: "org",
  defaultStaffGroupId: "00000000-0000-4000-8000-000000000002",
}
it("allows an organization invite with no active locations", () => {
  expect(
    staffInviteSelectionSchema.parse({ ...input, locationIds: [] }).locationIds
  ).toEqual([])
})
it("allows multiple distinct locations", () => {
  expect(
    staffInviteSelectionSchema.parse({
      ...input,
      locationIds: [location, input.defaultStaffGroupId],
    }).locationIds
  ).toHaveLength(2)
})
it("rejects duplicate or malformed locations and missing organization scope", () => {
  expect(
    staffInviteSelectionSchema.safeParse({
      ...input,
      locationIds: [location, location],
    }).success
  ).toBe(false)
  expect(
    staffInviteSelectionSchema.safeParse({ ...input, locationIds: ["invalid"] })
      .success
  ).toBe(false)
  expect(
    staffInviteSelectionSchema.safeParse({
      defaultStaffGroupId: input.defaultStaffGroupId,
      locationIds: [],
    }).success
  ).toBe(false)
})

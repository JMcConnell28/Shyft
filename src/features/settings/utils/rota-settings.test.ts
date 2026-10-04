import { describe, expect, it } from "vitest"

import type { RotaSettingsValues } from "@/features/settings/types"
import { rotaSettingsValuesSchema } from "@/features/settings/schemas/rota-settings-schemas"
import { normalizeRotaSettingsValues } from "@/features/settings/utils/rota-settings"

const SETTINGS: RotaSettingsValues = {
  allowEditAfterPublish: true,
  confirmShiftDelete: true,
  copyNotesByDefault: true,
  defaultZoneId: null,
  notifyStaffOnPublish: true,
  showNotesToStaff: true,
  timeFormat: "12h",
}

describe("rota settings", () => {
  it("merges a focused update without dropping other preferences", () => {
    expect(
      normalizeRotaSettingsValues(SETTINGS, {
        confirmShiftDelete: false,
        defaultZoneId: "8fd8f22b-0e5d-4c80-8263-e78d08146244",
      })
    ).toEqual({
      ...SETTINGS,
      confirmShiftDelete: false,
      defaultZoneId: "8fd8f22b-0e5d-4c80-8263-e78d08146244",
    })
  })

  it("does not mutate the current settings object", () => {
    const next = normalizeRotaSettingsValues(SETTINGS, {
      notifyStaffOnPublish: false,
    })

    expect(next).not.toBe(SETTINGS)
    expect(SETTINGS.notifyStaffOnPublish).toBe(true)
  })
  it("accepts and preserves a 24-hour preference and rejects invalid formats", () => {
    const updated = normalizeRotaSettingsValues(SETTINGS, { timeFormat: "24h" })
    expect(updated.timeFormat).toBe("24h")
    expect(
      normalizeRotaSettingsValues(updated, { confirmShiftDelete: false })
        .timeFormat
    ).toBe("24h")
    expect(rotaSettingsValuesSchema.parse(updated).timeFormat).toBe("24h")
    expect(
      rotaSettingsValuesSchema.safeParse({
        ...SETTINGS,
        timeFormat: "unsupported",
      }).success
    ).toBe(false)
    expect(
      rotaSettingsValuesSchema.parse({ ...SETTINGS, timeFormat: undefined })
        .timeFormat
    ).toBe("12h")
  })
})

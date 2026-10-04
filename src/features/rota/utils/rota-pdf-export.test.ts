import { describe, expect, it } from "vitest"
import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"
import { targetShift } from "@/features/rota/test/shift-assignment-fixture"
import { demoRotaBoardData } from "@/features/rota-demo/data/demo-rota-board"
import {
  buildRotaPdfDocumentData,
  buildRotaPdfFileName,
} from "@/features/rota/utils/rota-pdf-export"

describe("versioned rota exports", () => {
  it("includes the saved version in the filename", () => {
    expect(buildRotaPdfFileName("Harbour House", "2026-06-08", 3)).toBe(
      "rocketrota-harbour-house-2026-06-08-v3.pdf"
    )
  })
  it("keeps the same version on repeated exports of saved content", () => {
    const input = {
      assignmentIdsByShiftId: {},
      assignmentsById: {},
      employeesById: {},
      shiftsById: {},
      brandLogoUrl: null,
      days: demoRotaBoardData.days,
      employeeGroups: demoRotaBoardData.employeeGroups,
      location: demoRotaBoardData.location,
      meta: { ...demoRotaBoardData.meta, contentVersion: 3 },
      options: { visibleStats: [] },
      zones: demoRotaBoardData.zones,
    }
    const first = buildRotaPdfDocumentData(input)
    const second = buildRotaPdfDocumentData(input)
    expect(first.versionLabel).toBe("v3")
    expect(second.fileName).toBe(first.fileName)
    expect(second.versionLabel).toBe(first.versionLabel)
  })
  it.each<RotaTimeFormat>(["12h", "24h"])(
    "uses the location's %s format in exported shifts",
    (timeFormat) => {
      const document = buildRotaPdfDocumentData({
        assignmentIdsByShiftId: {},
        assignmentsById: {},
        employeesById: {},
        shiftsById: { target: targetShift },
        brandLogoUrl: null,
        days: demoRotaBoardData.days,
        employeeGroups: demoRotaBoardData.employeeGroups,
        location: demoRotaBoardData.location,
        meta: {
          ...demoRotaBoardData.meta,
          settings: { ...demoRotaBoardData.meta.settings, timeFormat },
        },
        options: { visibleStats: [] },
        zones: demoRotaBoardData.zones,
      })
      const shift = document.pages.find((page) => page.zoneId === "floor")
        ?.days[0]?.shifts[0]
      expect(shift?.timeLines).toEqual(
        timeFormat === "12h" ? ["9:00 AM - 3:00 PM"] : ["09:00 - 15:00"]
      )
    }
  )
})

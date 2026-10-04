import { describe, expect, it } from "vitest"
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
})

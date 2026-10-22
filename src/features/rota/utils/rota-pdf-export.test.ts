import { describe, expect, it } from "vitest"
import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"
import { targetShift } from "@/features/rota/test/shift-assignment-fixture"
import { demoRotaBoardData } from "@/features/rota-demo/data/demo-rota-board"
import {
  buildRotaPdfDocumentData,
  buildRotaPdfFileName,
} from "@/features/rota/utils/rota-pdf-export"

describe("versioned rota exports", () => {
  it("includes the publication number in the filename", () => {
    expect(
      buildRotaPdfFileName("Harbour House", "2026-06-08", {
        status: "published",
        publishedVersion: 3,
        hasUnpublishedChanges: false,
      })
    ).toBe("rocketrota-harbour-house-2026-06-08-v3.pdf")
  })
  it("uses the publication number rather than the saved revision", () => {
    const input = {
      assignmentIdsByShiftId: {},
      assignmentsById: {},
      employeesById: {},
      shiftsById: {},
      brandLogoUrl: null,
      days: demoRotaBoardData.days,
      employeeGroups: demoRotaBoardData.employeeGroups,
      location: demoRotaBoardData.location,
      meta: {
        ...demoRotaBoardData.meta,
        status: "published" as const,
        contentVersion: 12,
        publishedContentVersion: 12,
        publishedVersion: 3,
        hasUnpublishedChanges: false,
      },
      options: { visibleStats: [] },
      zones: demoRotaBoardData.zones,
    }
    const first = buildRotaPdfDocumentData(input)
    const second = buildRotaPdfDocumentData(input)
    expect(first.versionLabel).toBe("Published v3")
    expect(first.fileName).toContain("-v3.pdf")
    expect(second.fileName).toBe(first.fileName)
    expect(second.versionLabel).toBe(first.versionLabel)

    const unpublished = buildRotaPdfDocumentData({
      ...input,
      meta: { ...input.meta, contentVersion: 13, hasUnpublishedChanges: true },
    })
    expect(unpublished.versionLabel).toBe("Published v3 · Unpublished changes")
    expect(unpublished.fileName).toContain("-v3-draft.pdf")

    const draft = buildRotaPdfDocumentData({
      ...input,
      meta: { ...input.meta, status: "draft" },
    })
    expect(draft.versionLabel).toBe("Draft")
    expect(draft.fileName).toContain("-draft.pdf")
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

import { describe, expect, it } from "vitest"

import type { CompanyEmployeeListItem } from "@/features/company/types"
import {
  buildSageEmployeeImportPreview,
  parseSageEmployeeExport,
} from "@/features/company/utils/sage-employee-import"

const employees: CompanyEmployeeListItem[] = [
  {
    activeLocationCount: 1,
    email: "ada@example.com",
    groupName: "Bar",
    id: "11111111-1111-1111-1111-111111111111",
    locationCount: 1,
    name: "Ada Lovelace",
    payrollId: null,
    role: "employee",
    status: "active",
  },
  {
    activeLocationCount: 1,
    email: null,
    groupName: "Kitchen",
    id: "22222222-2222-2222-2222-222222222222",
    locationCount: 1,
    name: "Grace Hopper",
    payrollId: "7",
    role: "employee",
    status: "active",
  },
]

describe("parseSageEmployeeExport", () => {
  it("reads common Sage employee reference and name columns", () => {
    const rows = parseSageEmployeeExport(
      "Employee Reference,Employee Forename,Employee Surname,Email\r\n42,Ada,Lovelace,ada@example.com\r\n7,Grace,Hopper,"
    )

    expect(rows).toEqual([
      {
        email: "ada@example.com",
        fullName: "Ada Lovelace",
        payrollId: "42",
        rowNumber: 2,
      },
      {
        email: null,
        fullName: "Grace Hopper",
        payrollId: "7",
        rowNumber: 3,
      },
    ])
  })
})

describe("buildSageEmployeeImportPreview", () => {
  it("matches by email/name and only updates changed payroll IDs", () => {
    const preview = buildSageEmployeeImportPreview({
      employees,
      text: "Employee Reference,Employee Name,Email\n42,Ada Lovelace,ada@example.com\n7,Grace Hopper,\n9,Unknown Person,",
    })

    expect(preview.matches.map((match) => match.matchReason)).toEqual([
      "email",
      "name",
      "unmatched",
    ])
    expect(preview.updates).toEqual([
      {
        employeeId: "11111111-1111-1111-1111-111111111111",
        payrollId: "42",
      },
    ])
    expect(preview.skippedCount).toBe(2)
  })
})

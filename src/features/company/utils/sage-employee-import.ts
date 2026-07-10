import type {
  CompanyEmployeeListItem,
  CompanyEmployeePayrollUpdate,
} from "@/features/company/types"

type SageEmployeeImportRow = {
  rowNumber: number
  payrollId: string
  email: string | null
  fullName: string
}

type SageEmployeeImportMatch = {
  employee: CompanyEmployeeListItem | null
  matchReason: "email" | "name" | "unmatched" | "duplicate"
  row: SageEmployeeImportRow
}

type SageEmployeeImportPreview = {
  matches: SageEmployeeImportMatch[]
  updates: CompanyEmployeePayrollUpdate[]
  skippedCount: number
}

const payrollIdHeaders = [
  "employee reference",
  "employee ref",
  "employee number",
  "employee no",
  "works number",
  "work number",
  "payroll id",
  "payroll number",
]

const emailHeaders = ["email", "email address", "e-mail", "e-mail address"]
const fullNameHeaders = ["employee name", "name", "full name"]
const firstNameHeaders = ["employee forename", "forename", "first name"]
const lastNameHeaders = ["employee surname", "surname", "last name"]

function buildSageEmployeeImportPreview(input: {
  employees: CompanyEmployeeListItem[]
  text: string
}): SageEmployeeImportPreview {
  const rows = parseSageEmployeeExport(input.text)
  const matches = rows.map((row) => matchSageEmployeeRow(row, input.employees))
  const updates = matches
    .filter(
      (
        match
      ): match is SageEmployeeImportMatch & {
        employee: CompanyEmployeeListItem
      } => Boolean(match.employee) && match.matchReason !== "duplicate"
    )
    .filter((match) => match.employee.payrollId !== match.row.payrollId)
    .map((match) => ({
      employeeId: match.employee.id,
      payrollId: match.row.payrollId,
    }))

  return {
    matches,
    skippedCount: rows.length - updates.length,
    updates,
  }
}

function parseSageEmployeeExport(text: string): SageEmployeeImportRow[] {
  const records = parseCsv(text)
  const [headers, ...rows] = records

  if (!headers) {
    return []
  }

  const normalizedHeaders = headers.map(normalizeHeader)
  const payrollIdIndex = findHeaderIndex(normalizedHeaders, payrollIdHeaders)
  const emailIndex = findHeaderIndex(normalizedHeaders, emailHeaders)
  const fullNameIndex = findHeaderIndex(normalizedHeaders, fullNameHeaders)
  const firstNameIndex = findHeaderIndex(normalizedHeaders, firstNameHeaders)
  const lastNameIndex = findHeaderIndex(normalizedHeaders, lastNameHeaders)

  if (payrollIdIndex < 0) {
    throw new Error("The Sage file needs an Employee Reference column.")
  }

  return rows
    .map((row, index) => {
      const payrollId = getCell(row, payrollIdIndex)
      const email = emailIndex >= 0 ? getCell(row, emailIndex) : ""
      const fullName =
        fullNameIndex >= 0
          ? getCell(row, fullNameIndex)
          : [getCell(row, firstNameIndex), getCell(row, lastNameIndex)]
              .filter(Boolean)
              .join(" ")

      return {
        email: email || null,
        fullName,
        payrollId,
        rowNumber: index + 2,
      }
    })
    .filter((row) => row.payrollId && (row.email || row.fullName))
}

function matchSageEmployeeRow(
  row: SageEmployeeImportRow,
  employees: CompanyEmployeeListItem[]
): SageEmployeeImportMatch {
  if (row.email) {
    const emailMatches = employees.filter(
      (employee) =>
        employee.email &&
        normalizeText(employee.email) === normalizeText(row.email ?? "")
    )

    if (emailMatches.length === 1) {
      return {
        employee: emailMatches[0],
        matchReason: "email",
        row,
      }
    }

    if (emailMatches.length > 1) {
      return {
        employee: null,
        matchReason: "duplicate",
        row,
      }
    }
  }

  const nameMatches = employees.filter(
    (employee) => normalizeText(employee.name) === normalizeText(row.fullName)
  )

  if (nameMatches.length === 1) {
    return {
      employee: nameMatches[0],
      matchReason: "name",
      row,
    }
  }

  return {
    employee: null,
    matchReason: nameMatches.length > 1 ? "duplicate" : "unmatched",
    row,
  }
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let cell = ""
  let row: string[] = []
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      row.push(cell.trim())
      cell = ""
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1
      }
      row.push(cell.trim())
      if (row.some(Boolean)) {
        rows.push(row)
      }
      row = []
      cell = ""
    } else {
      cell += char
    }
  }

  row.push(cell.trim())
  if (row.some(Boolean)) {
    rows.push(row)
  }

  return rows
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  return headers.findIndex((header) => candidates.includes(header))
}

function getCell(row: string[], index: number) {
  return index >= 0 ? (row[index] ?? "").trim() : ""
}

function normalizeHeader(value: string) {
  return normalizeText(value.replace(/^\uFEFF/, ""))
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export { buildSageEmployeeImportPreview, parseSageEmployeeExport }
export type {
  SageEmployeeImportMatch,
  SageEmployeeImportPreview,
  SageEmployeeImportRow,
}

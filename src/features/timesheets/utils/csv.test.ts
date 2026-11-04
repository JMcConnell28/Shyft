import { describe, expect, it } from "vitest"

import { numericCsvCell, serializeCsv } from "@/features/timesheets/utils/csv"

describe("serializeCsv", () => {
  it("serializes quoted UTF-8 CSV with CRLF line endings", () => {
    const csv = serializeCsv([
      ["Name", "Notes", "Hours", "Blank"],
      ["Ada, Lovelace", 'Said "hello"\nand left', 7.5, null],
    ])

    expect(csv.startsWith("\uFEFF")).toBe(true)
    expect(csv).toBe(
      '\uFEFF"Name","Notes","Hours","Blank"\r\n"Ada, Lovelace","Said ""hello""\nand left","7.5",""'
    )
  })
  it.each([
    "=1+1",
    "+SUM(A1)",
    "-SUM(A1)",
    "@SUM(A1)",
    "\t=1+1",
    "\r=1+1",
    "\n=1+1",
    " \tAda",
    "\u0000 =1+1",
    "  =1+1",
    "＝1+1",
    "＋1+1",
    "－1+1",
    "＠SUM(A1)",
  ])("rejects formula-capable text %j", (value) => {
    expect(() => serializeCsv([[value]])).toThrow("payroll text field")
  })
  it("preserves numeric types and validated payroll formatting", () => {
    expect(
      serializeCsv([
        [
          -1.5,
          numericCsvCell("-1.50"),
          numericCsvCell("-1:30"),
          numericCsvCell("7.50"),
          "00042",
        ],
      ])
    ).toBe('\uFEFF"-1.5","-1.50","-1:30","7.50","00042"')
    expect(() => numericCsvCell("-1+SUM(A1)")).toThrow()
    expect(() => serializeCsv([[{ kind: "numeric", value: "=1+1" }]])).toThrow()
  })
})

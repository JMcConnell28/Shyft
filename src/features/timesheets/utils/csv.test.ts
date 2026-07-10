import { describe, expect, it } from "vitest"

import { serializeCsv } from "@/features/timesheets/utils/csv"

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
})

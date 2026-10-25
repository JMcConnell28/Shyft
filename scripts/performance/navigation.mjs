import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium } from "playwright"

if (!process.env.PERF_STORAGE_STATE || !process.env.PERF_START_PATH) {
  throw new Error(
    "Set PERF_STORAGE_STATE and PERF_START_PATH for an authenticated local profiling build"
  )
}
const label = process.env.PERF_LABEL ?? "latest"
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid PERF_LABEL")
const browser = await chromium.launch({
  channel: process.env.PERF_BROWSER_CHANNEL ?? "msedge",
  headless: true,
})
const results = []
try {
  const context = await browser.newContext({
    storageState: process.env.PERF_STORAGE_STATE,
  })
  const page = await context.newPage()
  await page.goto(
    new URL(
      process.env.PERF_START_PATH,
      process.env.PERF_ORIGIN ?? "http://localhost:3100"
    ).href
  )
  if (!new URL(page.url()).pathname.startsWith("/app/")) {
    throw new Error(
      "Authenticated workspace did not load; refresh the local test session"
    )
  }
  const workspacePath = new URL(page.url()).pathname
    .split("/")
    .slice(0, 3)
    .join("/")
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const section of ["rota", "timesheets", "time-clock", "dashboard"]) {
      const timing = page.waitForEvent("console", {
        timeout: 30_000,
        predicate: (event) => event.text().startsWith("[navigation-timing] "),
      })
      await page
        .locator(`a[href="${workspacePath}/${section}"]`)
        .first()
        .click()
      const event = await timing
      const data = JSON.parse(event.text().slice("[navigation-timing] ".length))
      // Explicit allowlist prevents query keys, URLs and console data leaking.
      results.push({
        cycle,
        destination: data.destination,
        loadMs: data.loadMs,
        totalMs: data.totalMs,
        reactRenderMs: data.reactRenderMs,
        commitAfterLoadMs: data.commitAfterLoadMs,
        codeTransferBytes: data.codeTransferBytes,
      })
    }
  }
} finally {
  await browser.close()
}
await mkdir(resolve(".performance", label), { recursive: true })
await writeFile(
  resolve(".performance", label, "navigation.json"),
  JSON.stringify(results, null, 2)
)
console.table(results)

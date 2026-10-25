import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium } from "playwright"
import { observePage, readPageMetrics } from "./browser-metrics.mjs"

const origin = new URL(process.env.PERF_ORIGIN ?? "http://localhost:3100")
const paths = process.argv.slice(2)
if (!paths.length) paths.push("/")
const label = process.env.PERF_LABEL ?? "latest"
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid PERF_LABEL")
const samples = Number(process.env.PERF_SAMPLES ?? 3)
if (!Number.isInteger(samples) || samples < 3 || samples > 30)
  throw new Error("Use 3–30 samples")
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PERF_BROWSER_CHANNEL ?? "msedge",
})
const results = []
try {
  for (const [routeIndex, path] of paths.entries()) {
    const target = new URL(path, origin)
    if (target.origin !== origin.origin)
      throw new Error("Paths must be same-origin")
    for (let sample = 0; sample < samples; sample++) {
      // A fresh context for each cold/warm pair isolates cookies and caches.
      const context = await browser.newContext({
        viewport:
          process.env.PERF_MOBILE === "1"
            ? { width: 390, height: 844 }
            : { width: 1280, height: 900 },
        ...(process.env.PERF_STORAGE_STATE
          ? { storageState: process.env.PERF_STORAGE_STATE }
          : {}),
      })
      await context.addInitScript(observePage)
      const page = await context.newPage()
      const cdp = await context.newCDPSession(page)
      if (process.env.PERF_MOBILE === "1") {
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })
        await cdp.send("Network.enable")
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 150,
          downloadThroughput: 200_000,
          uploadThroughput: 93_750,
        })
      }
      for (const temperature of ["cold-browser", "warm-browser"]) {
        await page.goto(target.href, { waitUntil: "load", timeout: 60_000 })
        if (await page.locator('script[src*="/@vite/client"]').count()) {
          throw new Error("Use a production build")
        }
        // Capture a fixed five-second window after load, including late data.
        await page.waitForTimeout(5000)
        results.push({
          routeIndex,
          sample,
          temperature,
          redirected: new URL(page.url()).pathname !== target.pathname,
          ...(await page.evaluate(readPageMetrics)),
        })
      }
      await context.close()
    }
  }
} finally {
  await browser.close()
}
const directory = resolve(".performance", label)
await mkdir(directory, { recursive: true })
await writeFile(
  resolve(
    directory,
    process.env.PERF_MOBILE === "1" ? "mobile.json" : "browser.json"
  ),
  JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)
)
console.table(
  results.map(({ longTasks, ...result }) => ({
    ...result,
    longTasks: longTasks.length,
  }))
)

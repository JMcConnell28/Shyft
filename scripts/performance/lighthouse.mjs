import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { createServer } from "node:net"
import lighthouse from "lighthouse"
import { chromium } from "playwright"

const url = new URL(
  process.argv[2] ?? "/",
  process.env.PERF_ORIGIN ?? "http://localhost:3100"
)
const label = process.env.PERF_LABEL ?? "latest"
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid PERF_LABEL")
const directory = resolve(".performance", label)
await mkdir(directory, { recursive: true })
const results = []
for (let sample = 0; sample < 3; sample++) {
  const reservation = createServer()
  await new Promise((done) => reservation.listen(0, "127.0.0.1", done))
  const address = reservation.address()
  if (!address || typeof address === "string")
    throw new Error("Cannot allocate debug port")
  const { port } = address
  await new Promise((done) => reservation.close(done))
  // Use an installed Edge binary; no personal browser profile is attached.
  const browser = await chromium.launch({
    channel: process.env.PERF_BROWSER_CHANNEL ?? "msedge",
    headless: true,
    args: [`--remote-debugging-port=${port}`],
  })
  try {
    const result = await lighthouse(url.href, {
      port,
      onlyCategories: ["performance"],
      output: "json",
      logLevel: "error",
    })
    if (!result || result.lhr.runtimeError) {
      throw new Error(
        result?.lhr.runtimeError?.code ?? "Lighthouse returned no result"
      )
    }
    const { lhr } = result
    const metric = (id) => lhr.audits[id]?.numericValue ?? null
    results.push({
      sample,
      score: lhr.categories.performance.score * 100,
      fcpMs: metric("first-contentful-paint"),
      lcpMs: metric("largest-contentful-paint"),
      tbtMs: metric("total-blocking-time"),
      cls: metric("cumulative-layout-shift"),
      speedIndexMs: metric("speed-index"),
      redirected: new URL(lhr.finalDisplayedUrl).pathname !== url.pathname,
    })
    // Raw Lighthouse reports may contain private URLs when authenticated.
    if (process.env.PERF_SAVE_RAW === "1") {
      await writeFile(
        resolve(directory, `lighthouse-${sample}.json`),
        result.report
      )
    }
  } finally {
    await browser.close()
  }
}
await writeFile(
  resolve(directory, "lighthouse.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      results,
    },
    null,
    2
  )
)
console.table(results)

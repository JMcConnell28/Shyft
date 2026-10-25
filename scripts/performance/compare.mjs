import { existsSync, readFileSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const labels = process.argv.slice(2)
if (
  labels.length !== 2 ||
  labels.some((label) => !/^[a-z0-9-]+$/.test(label))
) {
  throw new Error("Usage: npm run perf:compare -- baseline after")
}
function read(label, file) {
  const path = resolve(".performance", label, `${file}.json`)
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null
}
function median(values) {
  const sorted = values
    .filter((value) => typeof value === "number")
    .sort((a, b) => a - b)
  if (!sorted.length) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}
function summarizeBrowser(report) {
  if (!report) return null
  return Object.fromEntries(
    ["cold-browser", "warm-browser"].map((temperature) => {
      const rows = report.results.filter(
        (row) => row.temperature === temperature && !row.redirected
      )
      return [
        temperature,
        {
          samples: rows.length,
          ...Object.fromEntries(
            [
              "ttfbMs",
              "fcpMs",
              "lcpMs",
              "cls",
              "observedBlockingMs",
              "jsTransferBytes",
              "jsDecodedBytes",
            ].map((key) => [key, median(rows.map((row) => row[key]))])
          ),
        },
      ]
    })
  )
}
const stages = labels.map(
  (label) => read(label, "bundle")?.analysisStage ?? "generateBundle"
)
if (stages[0] !== stages[1]) {
  throw new Error(
    "Bundle analysis stages differ. Rebuild both labels with the same tooling."
  )
}
const results = {}
for (const label of labels) {
  const bundle = read(label, "bundle")
  const lighthouse = read(label, "lighthouse")
  const http = read(label, "http")
  results[label] = {
    bundle: bundle
      ? {
          stage: bundle.analysisStage ?? "generateBundle",
          bytes: bundle.initial.bytes,
          gzipBytes: bundle.initial.gzipBytes,
          brotliBytes: bundle.initial.brotliBytes,
          chunks: bundle.initial.files.length,
        }
      : null,
    browser: summarizeBrowser(read(label, "browser")),
    mobile: summarizeBrowser(read(label, "mobile")),
    lighthouse: lighthouse
      ? Object.fromEntries(
          ["score", "fcpMs", "lcpMs", "tbtMs", "cls"].map((key) => [
            key,
            median(
              lighthouse.results
                .filter((row) => !row.redirected)
                .map((row) => row[key])
            ),
          ])
        )
      : null,
    http:
      http?.results.filter(
        (row) => row.routeIndex === 0 && row.status === 200
      ) ?? null,
  }
}
await mkdir(".performance", { recursive: true })
await writeFile(
  ".performance/comparison.json",
  JSON.stringify(results, null, 2)
)
console.log(JSON.stringify(results, null, 2))

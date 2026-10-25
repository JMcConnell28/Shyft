import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const origin = new URL(process.env.PERF_ORIGIN ?? "http://localhost:3100")
const paths = process.argv.slice(2)
if (!paths.length) paths.push("/", "/login", "/dashboard?source=pwa")
const samples = Number(process.env.PERF_SAMPLES ?? 5)
if (!Number.isInteger(samples) || samples < 3 || samples > 30) {
  throw new Error("PERF_SAMPLES must be between 3 and 30")
}
const results = []
for (const [routeIndex, path] of paths.entries()) {
  const url = new URL(path, origin)
  if (url.origin !== origin.origin) throw new Error("Paths must be same-origin")
  for (let sample = 0; sample < samples; sample++) {
    const started = performance.now()
    const response = await fetch(url, {
      headers: {
        "accept-encoding": "gzip, br",
        ...(process.env.PERF_COOKIE ? { cookie: process.env.PERF_COOKIE } : {}),
      },
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    })
    const headersAt = performance.now()
    const body = await response.text()
    if (body.includes("/@vite/client"))
      throw new Error("Use a production server")
    results.push({
      routeIndex,
      sample,
      status: response.status,
      headersMs: Math.round((headersAt - started) * 10) / 10,
      totalMs: Math.round((performance.now() - started) * 10) / 10,
      decodedBytes: Buffer.byteLength(body),
      encoding: response.headers.get("content-encoding"),
      cacheControl: response.headers.get("cache-control"),
      serverTiming: response.headers.get("server-timing"),
      // No URLs, redirects, cookies or response bodies in the report.
    })
  }
}
const label = process.env.PERF_LABEL ?? "latest"
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid PERF_LABEL")
const directory = resolve(".performance", label)
await mkdir(directory, { recursive: true })
await writeFile(
  resolve(directory, "http.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: "HTTP only; first request includes a cold connection, not necessarily a cold process",
      results,
    },
    null,
    2
  )
)
console.table(results)

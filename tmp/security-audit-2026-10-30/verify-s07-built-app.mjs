import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"

const oldIds = [
  "020bb31270a3d20463452a1496fc66b63140b8d6de079dfa3606c57f78caed6c",
  "e6ef59b4a2fb34c35b1a83693211de67368a201cd97d76ef5d44616cbe239259",
]
const forbidden = [
  "/admin/clock-tags",
  "ADMIN_EMAILS",
  "getAdminClockTagsPageData",
  "generateAdminClockTagSetup",
  ...oldIds,
]

async function inspectArtifacts(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await inspectArtifacts(path)
    else if (/\.(mjs|js|json)$/.test(entry.name)) {
      const source = await readFile(path, "utf8")
      for (const value of forbidden) assert(!source.includes(value), `Retired admin reference in ${path}: ${value}`)
    }
  }
}

await inspectArtifacts(".output/server")
await inspectArtifacts(".output/public")
console.log("Fresh server/client artifacts contain no legacy admin route, allowlist or RPC registrations.")

const origin = "http://127.0.0.1:3907"
const child = spawn(process.execPath, ["--env-file=.env.local", ".output/server/index.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: "3907" },
  stdio: "ignore",
  windowsHide: true,
})
const exited = new Promise((resolve) => child.once("exit", resolve))
try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error("Fixture production server exited before readiness.")
    try {
      const response = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(500) })
      if (response.ok) { ready = true; break }
    } catch {}
    await setTimeout(250)
  }
  assert(ready, "Fixture production server did not become ready.")
  const oldPage = await fetch(`${origin}/admin/clock-tags`, { redirect: "manual", signal: AbortSignal.timeout(10000) })
  assert.equal(oldPage.status, 404)
  console.log("GET /admin/clock-tags: 404")
  for (const id of oldIds) {
    const response = await fetch(`${origin}/_serverFn/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin, "sec-fetch-site": "same-origin" },
      body: JSON.stringify({ data: { userId: "s07-retired-path-fixture" } }),
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    })
    assert(response.status >= 400, "A retired RPC returned a successful response.")
    console.log(`Retired RPC ${id.slice(0, 12)}: ${response.status}; registration absent from build`)
  }
} finally {
  child.kill()
  await exited
}

import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { randomBytes } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"

const retiredFunctions = [
  "020bb31270a3d20463452a1496fc66b63140b8d6de079dfa3606c57f78caed6c",
  "e6ef59b4a2fb34c35b1a83693211de67368a201cd97d76ef5d44616cbe239259",
]
const removed = [
  "/admin/clock-tags",
  "ADMIN_EMAILS",
  "getAdminClockTagsPageData",
  "generateAdminClockTagSetup",
  ...retiredFunctions,
]
const devPackages = "shadcn|lighthouse|puppeteer-core|@puppeteer/browsers|extract-zip|@react-email/render"
const bundledDevPackage = new RegExp("/node_modules/(?:" + devPackages + ")(?:/|$)")
const devImport = new RegExp(String.raw`(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)["'](?:` + devPackages + String.raw`)(?:["'/])`)
let inspected = 0

async function inspectArtifacts(directory, main) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      assert(!bundledDevPackage.test(path.replaceAll("\\", "/")), "Development package in build: " + path)
      await inspectArtifacts(path, main)
    } else if (/\.(mjs|js|json)$/.test(entry.name)) {
      const source = await readFile(path, "utf8")
      if (main) {
        for (const value of removed) assert(!source.includes(value), "Retired reference in " + path)
      }
      assert(!devImport.test(source), "Development package import in " + path)
      inspected++
    }
  }
}

const adminOnly = process.argv.includes("--admin-only")
const base = adminOnly ? "apps/admin/.output" : ".output"
for (const directory of ["server", "public"]) {
  await inspectArtifacts(join(base, directory), !adminOnly)
}
console.log("Inspected " + inspected + " production files for retired paths and excluded tooling.")
if (adminOnly) process.exit(0)

const origin = "http://127.0.0.1:3907"
const secret = randomBytes(32).toString("hex")
const child = spawn(process.execPath, ["--env-file=.env.local", ".output/server/index.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: "3907", BILLING_RECONCILIATION_SECRET: secret },
  stdio: "ignore",
  windowsHide: true,
})
const exited = new Promise((resolve) => child.once("exit", resolve))
const request = (path, init) => fetch(origin + path, {
  ...init,
  redirect: "manual",
  signal: AbortSignal.timeout(15000),
})

try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(child.exitCode, null, "Fixture production server exited.")
    try {
      if ((await request("/robots.txt")).ok) {
        ready = true
        break
      }
    } catch {}
    await setTimeout(250)
  }
  assert(ready, "Fixture production server did not become ready.")
  let login = await request("/login")
  for (let redirects = 0; redirects < 3 && login.status >= 300 && login.status < 400; redirects++) {
    const location = login.headers.get("location")
    assert(location, "Missing location on login redirect.")
    const destination = new URL(location, origin)
    assert.equal(destination.origin, origin, "Login redirected outside the local fixture.")
    login = await request(destination.pathname + destination.search)
  }
  assert.equal(login.status, 200, "Login did not resolve to an SSR page.")
  const nonce = /'nonce-([^']+)'/.exec(login.headers.get("content-security-policy") ?? "")?.[1]
  assert(nonce && (await login.text()).includes('nonce="' + nonce + '"'), "SSR script nonce does not match CSP.")
  console.log("The login page's SSR script nonce matches the response CSP.")
  assert.equal((await request("/admin/clock-tags")).status, 404)
  for (const id of retiredFunctions) {
    const response = await request("/_serverFn/" + id, {
      method: "POST",
      headers: { "content-type": "application/json", origin, "sec-fetch-site": "same-origin" },
      body: JSON.stringify({ data: { userId: "s07-retired-path-fixture" } }),
    })
    assert(response.status >= 400, "Retired function was accepted.")
  }
  console.log("Retired route returned 404 and both retired server functions rejected requests.")
  for (const format of ["html", "json"]) {
    const response = await request("/api/personal-data/bcbedb2d-1fb1-4b8d-8a53-4a2fe0a437dd?format=" + format)
    assert.equal(response.status, 404)
    assert.match(await response.text(), /This download is unavailable/)
    const csp = response.headers.get("content-security-policy") ?? ""
    assert(csp.includes("default-src 'none'") && csp.includes("sandbox") && csp.includes("'nonce-"), "Missing composed CSP: " + csp)
    assert.match(response.headers.get("cache-control") ?? "", /no-store/)
    console.log(format + " privacy request returned 404 with sandbox CSP and the global nonce policy.")
  }

  const reconciliation = (token) => request("/api/billing/reconcile?dryRun=1", {
    method: "POST",
    headers: token ? { authorization: "Bearer " + token } : undefined,
  })
  assert.equal((await reconciliation()).status, 401)
  assert.equal((await reconciliation("invalid-token")).status, 401)
  const dryRun = await reconciliation(secret)
  assert.equal(dryRun.status, 200)
  assert.match(dryRun.headers.get("cache-control") ?? "", /no-store/)
  const result = await dryRun.json()
  assert.equal(result.dryRun, true)
  assert.equal(typeof result.health.needsAttention, "boolean")
  console.log("Reconciliation returned 401 without a valid token and 200 for the authorized read-only dry run.")
} finally {
  child.kill()
  await exited
}

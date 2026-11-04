import fs from "node:fs"
import path from "node:path"
import process from "node:process"

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=")

        if (separatorIndex === -1) {
          return null
        }

        const key = line.slice(0, separatorIndex).trim()
        const rawValue = line.slice(separatorIndex + 1).trim()
        const value = rawValue.replace(/^["']|["']$/g, "")

        return [key, value]
      })
      .filter(Boolean)
  )
}

function loadEnv() {
  const root = process.cwd()

  return {
    ...readEnvFile(path.join(root, ".env")),
    ...readEnvFile(path.join(root, ".env.local")),
    ...process.env,
  }
}

function getRequiredValue(env, key) {
  const value = env[key]

  if (!value) {
    throw new Error(`${key} is missing.`)
  }

  return value
}

async function main() {
  const env = loadEnv()
  const baseUrl = env.BETTER_AUTH_URL ?? "http://localhost:3000"
  const secret = getRequiredValue(env, "BILLING_RECONCILIATION_SECRET")
  const endpoint = new URL("/api/billing/reconcile", baseUrl)
  if (process.argv.includes("--dry-run"))
    endpoint.searchParams.set("dryRun", "1")
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
    },
    signal: AbortSignal.timeout(60_000),
  })
  const body = await response.json()

  if (!response.ok) {
    console.error(body)
    process.exit(1)
  }

  console.log(JSON.stringify(body, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

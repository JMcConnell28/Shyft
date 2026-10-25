import { spawnSync } from "node:child_process"
import { finalizeBundleReport } from "./finalize-bundle-report.mjs"

const label = process.argv[2] ?? "latest"
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Use a lowercase build label")
const result = spawnSync(
  process.execPath,
  ["--max-old-space-size=3072", "node_modules/vite/bin/vite.js", "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PERF_ANALYZE: "1",
      PERF_LABEL: label,
      VITE_PERFORMANCE_PROFILE: process.argv.includes("--profile")
        ? "true"
        : "false",
    },
  }
)
if (result.error) throw result.error
process.exitCode = result.status ?? 1
if (result.status === 0) await finalizeBundleReport(label)

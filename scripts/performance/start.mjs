import { spawn } from "node:child_process"

const envFile = process.env.PERF_ENV_FILE ?? ".env.local"
process.loadEnvFile(envFile)
// Nitro's installed schedule runner explicitly checks TEST. Prevent local
// measurements from executing attendance or billing background jobs.
const child = spawn(process.execPath, [".output/server/index.mjs"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    TEST: "1",
    NITRO_HOST: "127.0.0.1",
    NITRO_PORT: process.env.PERF_PORT ?? "3100",
    BETTER_AUTH_URL: `http://localhost:${process.env.PERF_PORT ?? "3100"}`,
    APP_BASE_URL: `http://localhost:${process.env.PERF_PORT ?? "3100"}`,
  },
})
child.on("error", (error) => {
  console.error(error)
  process.exitCode = 1
})
child.on("exit", (code) => {
  process.exitCode = code ?? 1
})
process.on("SIGINT", () => child.kill("SIGINT"))
process.on("SIGTERM", () => child.kill("SIGTERM"))

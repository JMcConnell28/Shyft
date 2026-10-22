import { defineConfig } from "vitest/config"

export default defineConfig({
  cacheDir: "../../node_modules/.vite-admin",
  resolve: { tsconfigPaths: true },
  test: { environment: "node", maxWorkers: 2 },
})

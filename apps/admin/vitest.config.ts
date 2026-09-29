import { defineConfig } from "vitest/config"
import viteTsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  cacheDir: "../../node_modules/.vite-admin",
  plugins: [viteTsConfigPaths({ projects: ["./tsconfig.json"] })],
  test: { environment: "node" },
})

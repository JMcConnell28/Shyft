import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { loadEnv } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const configDir = dirname(fileURLToPath(import.meta.url))
const rootEnvDir = resolve(configDir, "../..")

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, rootEnvDir, ""))

  return {
    envDir: rootEnvDir,
    server: {
      host: true,
      port: 3001,
    },
    preview: {
      host: true,
      port: 3001,
    },
    plugins: [
      nitro(),
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  }
})

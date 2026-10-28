import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, loadEnv } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { redact } from "@tanstack/redact/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import { reactCompiler } from "../../scripts/vite/react-compiler.ts"

const configDir = dirname(fileURLToPath(import.meta.url))
const rootEnvDir = resolve(configDir, "../..")

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, rootEnvDir, ""))

  return {
    envDir: rootEnvDir,
    resolve: { tsconfigPaths: true },
    ssr: { noExternal: true },
    server: {
      host: true,
      port: 3001,
    },
    preview: {
      host: true,
      port: 3001,
    },
    plugins: [
      tanstackStart(),
      nitro(),
      tailwindcss(),
      viteReact(),
      reactCompiler(),
      redact(),
    ],
  }
})

import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: "@noble/ciphers/utils.js",
        replacement: "/src/lib/shims/noble-ciphers-utils.ts",
      },
    ],
  },
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
  },
  environments: {
    ssr: {
      build: {
        rolldownOptions: {
          output: { banner: 'import "reflect-metadata";' },
        },
      },
    },
  },
  plugins: [
    tanstackStart(),
    devtools(),
    nitro({
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
      experimental: { tasks: true },
      tasks: {
        "time-clock:process": {
          handler: fileURLToPath(
            new URL(
              "./src/features/time-clock/server/automatic-clock-out-task.ts",
              import.meta.url
            )
          ),
        },
      },
      scheduledTasks:
        process.env.NODE_ENV === "production"
          ? { "* * * * *": ["time-clock:process"] }
          : {},
      compressPublicAssets: {
        brotli: true,
        gzip: true,
      },
      routeRules: {
        "/assets/**": {
          headers: {
            "cache-control": "public, max-age=31536000, immutable",
          },
        },
        "/brand/**": {
          headers: {
            "cache-control":
              "public, max-age=604800, stale-while-revalidate=86400",
          },
        },
        "/pwa/**": {
          headers: {
            "cache-control":
              "public, max-age=604800, stale-while-revalidate=86400",
          },
        },
      },
    }),
    tailwindcss(),
    viteReact(),
  ],
})

export default config

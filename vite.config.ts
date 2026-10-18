import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
// import mdx from "fumadocs-mdx/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import type { RenderedChunk } from "rollup"

function reflectMetadataServerBanner(chunk: RenderedChunk): string {
  const isServerChunk =
    chunk.fileName.startsWith("_libs/") || chunk.fileName.startsWith("_ssr/")

  return isServerChunk ? `import "reflect-metadata";` : ""
}

const config = defineConfig({
  resolve: {
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
  build: {
    rollupOptions: {
      output: {
        banner: reflectMetadataServerBanner,
      },
    },
  },
  plugins: [
    tanstackStart(),
    // mdx(),
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
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
  ],
})

export default config

import type { RenderedChunk } from "rollup"
import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import mdx from "fumadocs-mdx/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

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
    mdx(),
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

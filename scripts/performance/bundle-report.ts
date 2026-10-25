import { mkdir, writeFile } from "node:fs/promises"
import { relative, resolve } from "node:path"
import { brotliCompressSync, gzipSync } from "node:zlib"
import type { Plugin } from "vite"

// Build-time only. Reports stay outside the public output and contain no source.
export function bundleReport(): Plugin {
  return {
    name: "performance-bundle-report",
    apply: "build",
    async generateBundle(_options, bundle) {
      if (this.environment.name !== "client") return
      const chunks = Object.values(bundle)
        .flatMap((output) => {
          if (output.type !== "chunk") return []
          return [
            {
              file: output.fileName,
              entry: output.isEntry,
              imports: output.imports,
              dynamicImports: output.dynamicImports,
              css: [...(output.viteMetadata?.importedCss ?? [])],
              bytes: Buffer.byteLength(output.code),
              gzipBytes: gzipSync(output.code).length,
              brotliBytes: brotliCompressSync(output.code).length,
              modules: Object.entries(output.modules)
                .map(([id, module]) => ({
                  id: relative(process.cwd(), id).replaceAll("\\", "/"),
                  renderedBytes: module.renderedLength,
                }))
                .sort((a, b) => b.renderedBytes - a.renderedBytes),
            },
          ]
        })
        .sort((a, b) => b.bytes - a.bytes)
      const initial = new Set<string>()
      function visit(file: string): void {
        if (initial.has(file)) return
        initial.add(file)
        chunks.find((chunk) => chunk.file === file)?.imports.forEach(visit)
      }
      chunks
        .filter((chunk) => chunk.entry)
        .forEach((chunk) => visit(chunk.file))
      const initialChunks = chunks.filter((chunk) => initial.has(chunk.file))
      const report = {
        generatedAt: new Date().toISOString(),
        bundler: {
          vite: this.meta.viteVersion,
          rolldown: this.meta.rolldownVersion,
        },
        // Static entry closure excludes destination route chunks and CSS/fonts.
        initial: {
          files: initialChunks.map((chunk) => chunk.file),
          bytes: initialChunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
          gzipBytes: initialChunks.reduce(
            (sum, chunk) => sum + chunk.gzipBytes,
            0
          ),
          brotliBytes: initialChunks.reduce(
            (sum, chunk) => sum + chunk.brotliBytes,
            0
          ),
        },
        chunks,
      }
      const label = process.env.PERF_LABEL ?? "latest"
      if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid PERF_LABEL")
      const directory = resolve(".performance", label)
      await mkdir(directory, { recursive: true })
      await writeFile(
        resolve(directory, "bundle.json"),
        JSON.stringify(report, null, 2)
      )
      console.info(
        `[performance] Bundle report: .performance/${label}/bundle.json`
      )
    },
  }
}

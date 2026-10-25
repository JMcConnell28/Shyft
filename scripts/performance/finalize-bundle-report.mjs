import { existsSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { brotliCompressSync, gzipSync } from "node:zlib"
import { z } from "zod"

const reportSchema = z
  .object({
    initial: z
      .object({ files: z.array(z.string()), bytes: z.number() })
      .loose(),
    chunks: z.array(
      z
        .object({
          file: z.string().regex(/^assets\/[^/]+\.js$/),
          bytes: z.number(),
          gzipBytes: z.number(),
          brotliBytes: z.number(),
        })
        .loose()
    ),
  })
  .loose()

// Later Vite/framework finalization can modify an entry after generateBundle.
// Read delivered files and actual Nitro compression variants after build exits.
export async function finalizeBundleReport(label) {
  if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid PERF_LABEL")
  const path = resolve(".performance", label, "bundle.json")
  const report = reportSchema.parse(JSON.parse(await readFile(path, "utf8")))
  report.bundlerStageInitial ??= report.initial
  report.chunks = await Promise.all(
    report.chunks.map(async (chunk) => {
      const file = resolve(".output/public", chunk.file)
      const code = await readFile(file)
      return {
        ...chunk,
        bytes: code.length,
        gzipBytes: existsSync(`${file}.gz`)
          ? (await readFile(`${file}.gz`)).length
          : gzipSync(code).length,
        brotliBytes: existsSync(`${file}.br`)
          ? (await readFile(`${file}.br`)).length
          : brotliCompressSync(code).length,
      }
    })
  )
  const initialChunks = report.chunks.filter((chunk) =>
    report.initial.files.includes(chunk.file)
  )
  report.initial = {
    files: report.initial.files,
    bytes: initialChunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
    gzipBytes: initialChunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0),
    brotliBytes: initialChunks.reduce(
      (sum, chunk) => sum + chunk.brotliBytes,
      0
    ),
  }
  report.analysisStage = "nitro-output"
  await writeFile(path, JSON.stringify(report, null, 2))
  const { files, ...sizes } = report.initial
  console.info("[performance] Final delivered entry sizes:", {
    chunks: files.length,
    ...sizes,
  })
}

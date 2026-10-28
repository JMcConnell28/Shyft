import type { RotaPdfDocumentData } from "@/features/rota/types/rota-pdf"
import { rotaPdfWorkerResponseSchema } from "@/features/rota/schemas/rota-pdf-worker-schema"

async function generateRotaPdf(data: RotaPdfDocumentData): Promise<Blob> {
  const worker = new Worker(
    new URL("../workers/rota-pdf.worker.ts", import.meta.url),
    { type: "module", name: "rocketrota-pdf" }
  )

  return new Promise<Blob>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<unknown>) => {
      const result = rotaPdfWorkerResponseSchema.safeParse(event.data)
      if (!result.success) {
        reject(new Error("Invalid response from the rota PDF renderer."))
      } else if (result.data.type === "error") {
        reject(new Error(result.data.message))
      } else {
        resolve(result.data.blob)
      }
    }
    worker.onerror = () =>
      reject(new Error("Unable to start the rota PDF renderer."))
    worker.onmessageerror = () =>
      reject(new Error("Unable to read the rota PDF."))
    worker.postMessage({ type: "render", data })
  }).finally(() => worker.terminate())
}

export { generateRotaPdf }

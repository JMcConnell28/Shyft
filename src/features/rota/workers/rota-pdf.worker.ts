import { rotaPdfWorkerRequestSchema } from "@/features/rota/schemas/rota-pdf-worker-schema"
import { renderRotaPdf } from "@/features/rota/workers/render-rota-pdf"

// Vite's separate worker build keeps this custom renderer on native React.
addEventListener("message", async (event: MessageEvent<unknown>) => {
  const request = rotaPdfWorkerRequestSchema.safeParse(event.data)
  if (!request.success) {
    postMessage({ type: "error", message: "Invalid rota PDF data." })
    return
  }

  try {
    const blob = await renderRotaPdf(request.data.data)
    postMessage({ type: "complete", blob })
  } catch (error) {
    postMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to render the rota PDF.",
    })
  }
})

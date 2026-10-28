import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { RotaPdfDocumentData } from "@/features/rota/types/rota-pdf"
import { rotaPdfWorkerRequestSchema } from "@/features/rota/schemas/rota-pdf-worker-schema"
import { generateRotaPdf } from "./generate-rota-pdf"

type WorkerStub = {
  onmessage: ((event: MessageEvent<unknown>) => void) | null
  onerror: (() => void) | null
  onmessageerror: (() => void) | null
  postMessage: ReturnType<typeof vi.fn>
  terminate: ReturnType<typeof vi.fn>
}

const documentData: RotaPdfDocumentData = {
  fileName: "test.pdf",
  versionLabel: "Test",
  generatedAtLabel: "Test",
  brandLogoUrl: null,
  locationName: "Test location",
  note: null,
  options: { visibleStats: [] },
  weekLabel: "Test week",
  pages: [],
}

let worker: WorkerStub

beforeEach(() => {
  worker = {
    onmessage: null,
    onerror: null,
    onmessageerror: null,
    postMessage: vi.fn(),
    terminate: vi.fn(),
  }
  vi.stubGlobal(
    "Worker",
    class {
      constructor() {
        return worker
      }
    }
  )
})

afterEach(() => vi.unstubAllGlobals())

describe("rota PDF worker lifecycle", () => {
  it("returns the PDF and terminates the worker", async () => {
    const pending = generateRotaPdf(documentData)
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: "render",
      data: documentData,
    })
    const blob = new Blob(["%PDF-test"], { type: "application/pdf" })
    worker.onmessage?.(
      new MessageEvent("message", { data: { type: "complete", blob } })
    )
    await expect(pending).resolves.toBe(blob)
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it.each([
    {
      response: { type: "error", message: "Render failed" },
      message: "Render failed",
    },
    {
      response: { type: "complete", blob: "invalid" },
      message: "Invalid response",
    },
  ])(
    "rejects invalid or failed renderer responses",
    async ({ response, message }) => {
      const pending = generateRotaPdf(documentData)
      worker.onmessage?.(new MessageEvent("message", { data: response }))
      await expect(pending).rejects.toThrow(message)
      expect(worker.terminate).toHaveBeenCalledOnce()
    }
  )

  it.each(["onerror", "onmessageerror"] as const)(
    "cleans up on %s",
    async (event) => {
      const pending = generateRotaPdf(documentData)
      worker[event]?.()
      await expect(pending).rejects.toThrow()
      expect(worker.terminate).toHaveBeenCalledOnce()
    }
  )

  it("cleans up when posting the input fails", async () => {
    worker.postMessage.mockImplementation(() => {
      throw new Error("Clone failed")
    })
    await expect(generateRotaPdf(documentData)).rejects.toThrow("Clone failed")
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("rejects when a worker cannot be created", async () => {
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          throw new Error("Worker blocked")
        }
      }
    )
    await expect(generateRotaPdf(documentData)).rejects.toThrow(
      "Worker blocked"
    )
  })

  it("validates data crossing the worker boundary", () => {
    expect(
      rotaPdfWorkerRequestSchema.safeParse({
        type: "render",
        data: documentData,
      }).success
    ).toBe(true)
    expect(
      rotaPdfWorkerRequestSchema.safeParse({ type: "render", data: {} }).success
    ).toBe(false)
  })
})

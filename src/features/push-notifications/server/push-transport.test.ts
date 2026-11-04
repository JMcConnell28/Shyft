import { createECDH, randomBytes } from "node:crypto"
import { EventEmitter } from "node:events"
import webPush from "web-push"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { sendWebPush } from "./push-transport"
import type { RequestOptions } from "node:https"
import {
  PUSH_REQUEST_TIMEOUT_MS,
  PUSH_RESPONSE_MAX_BYTES,
  PUSH_SOCKET_TIMEOUT_MS,
} from "@/features/push-notifications/constants/push-limits"

const { request, createAgent, destroyAgent } = vi.hoisted(() => ({
  request: vi.fn(),
  createAgent: vi.fn(),
  destroyAgent: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("node:https", () => ({ request }))
vi.mock("./push-agent", () => ({ createPushAgent: createAgent }))

class RequestDouble extends EventEmitter {
  end = vi.fn()
  destroy(error: Error) {
    this.emit("error", error)
    return this
  }
}
class ResponseDouble extends EventEmitter {
  statusCode = 201
  headers: Record<string, string> = {}
  destroy(error: Error) {
    this.emit("error", error)
    return this
  }
}
const keys = createECDH("prime256v1")
keys.generateKeys()
const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/test-only-token",
  keys: {
    auth: randomBytes(16).toString("base64url"),
    p256dh: keys.getPublicKey().toString("base64url"),
  },
}
const payload = { title: "Test", body: "Encrypted message", tag: "safe/topic" }
let outgoing: RequestDouble
let incoming: ResponseDouble

beforeEach(() => {
  vi.resetAllMocks()
  outgoing = new RequestDouble()
  incoming = new ResponseDouble()
  createAgent.mockReturnValue({ destroy: destroyAgent })
  const vapid = webPush.generateVAPIDKeys()
  webPush.setVapidDetails(
    "mailto:test@example.invalid",
    vapid.publicKey,
    vapid.privateKey
  )
  request.mockImplementation(
    (
      _url: URL,
      _options: RequestOptions,
      onResponse: (response: ResponseDouble) => void
    ) => {
      outgoing.end.mockImplementation(() =>
        queueMicrotask(() => {
          onResponse(incoming)
          incoming.emit("end")
        })
      )
      return outgoing
    }
  )
})
afterEach(() => vi.restoreAllMocks())

describe("bounded Web Push transport", () => {
  it("retains real encryption and VAPID signing while using a checked HTTPS agent", async () => {
    await sendWebPush(subscription, payload)
    expect(request).toHaveBeenCalledWith(
      new URL(subscription.endpoint),
      expect.objectContaining({
        method: "POST",
        timeout: PUSH_SOCKET_TIMEOUT_MS,
        maxHeaderSize: PUSH_RESPONSE_MAX_BYTES,
        agent: expect.objectContaining({ destroy: destroyAgent }),
        signal: expect.any(AbortSignal),
        headers: expect.objectContaining({
          "Content-Encoding": "aes128gcm",
          Authorization: expect.stringMatching(/^vapid /u),
        }),
      }),
      expect.any(Function)
    )
    expect(outgoing.end).toHaveBeenCalledWith(expect.any(Buffer))
    expect(destroyAgent).toHaveBeenCalledOnce()
  })

  it("blocks a historical unsafe endpoint before constructing any request", async () => {
    await expect(
      sendWebPush(
        { ...subscription, endpoint: "https://127.0.0.1:8443/" },
        payload
      )
    ).rejects.toThrow("not supported")
    expect(createAgent).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
  })

  it.each([301, 302, 307, 308, 404, 410, 500])(
    "rejects HTTP %s without following a redirect",
    async (statusCode) => {
      incoming.statusCode = statusCode
      incoming.headers.location = "https://127.0.0.1/internal"
      await expect(sendWebPush(subscription, payload)).rejects.toMatchObject({
        statusCode,
      })
      expect(request).toHaveBeenCalledOnce()
      expect(destroyAgent).toHaveBeenCalledOnce()
    }
  )

  it("destroys an idle request on socket timeout", async () => {
    request.mockReturnValue(outgoing)
    const sending = sendWebPush(subscription, payload)
    outgoing.emit("timeout")
    await expect(sending).rejects.toThrow("timed out")
    expect(destroyAgent).toHaveBeenCalledOnce()
  })

  it("passes a total deadline that aborts a request even without a response", async () => {
    const controller = new AbortController()
    const timeout = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(controller.signal)
    request.mockImplementation((_url: URL, options: RequestOptions) => {
      options.signal?.addEventListener(
        "abort",
        () => outgoing.destroy(new Error("deadline")),
        { once: true }
      )
      return outgoing
    })
    const sending = sendWebPush(subscription, payload)
    controller.abort()
    await expect(sending).rejects.toThrow("deadline")
    expect(timeout).toHaveBeenCalledWith(PUSH_REQUEST_TIMEOUT_MS)
    expect(destroyAgent).toHaveBeenCalledOnce()
  })

  it("rejects oversized response bodies without retaining their contents", async () => {
    request.mockImplementation(
      (
        _url: URL,
        _options: RequestOptions,
        onResponse: (response: ResponseDouble) => void
      ) => {
        outgoing.end.mockImplementation(() =>
          queueMicrotask(() => {
            onResponse(incoming)
            incoming.emit("data", Buffer.alloc(PUSH_RESPONSE_MAX_BYTES + 1))
          })
        )
        return outgoing
      }
    )
    await expect(sendWebPush(subscription, payload)).rejects.toThrow(
      "size limit"
    )
    expect(destroyAgent).toHaveBeenCalledOnce()
  })
})

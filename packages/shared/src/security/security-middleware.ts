import {
  createCsrfMiddleware,
  createIsomorphicFn,
  createMiddleware,
  getGlobalStartContext,
} from "@tanstack/react-start"
import { setResponseHeaders } from "@tanstack/react-start/server"
import { z } from "zod"

import { createSecurityHeaders } from "./http-security"
import { composeResponseSecurityHeaders } from "./response-headers"

// Defining a Start instance replaces its default middleware list.
const serverFunctionCsrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === "serverFn",
})
const securityContextSchema = z.object({ nonce: z.string().min(1) })

const securityMiddleware = createMiddleware().server(async ({ next }) => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const nonce = btoa(String.fromCharCode(...bytes))
  const headers = createSecurityHeaders({
    nonce,
    production: import.meta.env.PROD,
  })
  try {
    const result = await next({ context: { nonce } })
    // Start applies header helper writes when adopting the handler's Response.
    // Wait for that response so its CSP is still available for composition.
    setResponseHeaders(
      composeResponseSecurityHeaders(result.response.headers, headers)
    )
    return result
  } catch (error) {
    setResponseHeaders(
      error instanceof Response
        ? composeResponseSecurityHeaders(error.headers, headers)
        : headers
    )
    throw error
  }
})

const getSecuritySsrOptions = createIsomorphicFn().server(() => {
  return securityContextSchema.parse(getGlobalStartContext())
})

export {
  getSecuritySsrOptions,
  securityMiddleware,
  serverFunctionCsrfMiddleware,
}

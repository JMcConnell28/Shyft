import {
  createCsrfMiddleware,
  createIsomorphicFn,
  createMiddleware,
  getGlobalStartContext,
} from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"
import { z } from "zod"

import { createSecurityHeaders } from "./http-security"

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
  headers.forEach((value, name) => setResponseHeader(name, value))

  const result = await next({ context: { nonce } })
  // Explicit route Responses (including auth) must receive the same protections.
  headers.forEach((value, name) => result.response.headers.set(name, value))
  return result
})

const getSecuritySsrOptions = createIsomorphicFn().server(() => {
  return securityContextSchema.parse(getGlobalStartContext())
})

export {
  getSecuritySsrOptions,
  securityMiddleware,
  serverFunctionCsrfMiddleware,
}

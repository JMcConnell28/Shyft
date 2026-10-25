import { createStart } from "@tanstack/react-start"
import {
  securityMiddleware,
  serverFunctionCsrfMiddleware,
} from "@rocketrota/shared/security"
import { performanceMiddleware } from "@/lib/performance-middleware"

export const startInstance = createStart(() => ({
  requestMiddleware: [
    securityMiddleware,
    serverFunctionCsrfMiddleware,
    performanceMiddleware,
  ],
}))

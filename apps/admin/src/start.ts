import { createStart } from "@tanstack/react-start"
import {
  securityMiddleware,
  serverFunctionCsrfMiddleware,
} from "@rocketrota/shared/security"

export const startInstance = createStart(() => ({
  requestMiddleware: [securityMiddleware, serverFunctionCsrfMiddleware],
}))

import { createIsomorphicFn } from "@tanstack/react-start"

const isDevelopmentEmailVerificationBypassed = createIsomorphicFn()
  .server(
    () =>
      process.env.NODE_ENV !== "production" &&
      process.env.DEV_BYPASS_EMAIL_VERIFICATION === "true",
  )
  .client(
    () =>
      import.meta.env.DEV &&
      import.meta.env.VITE_DEV_BYPASS_EMAIL_VERIFICATION === "true",
  )

function isEmailVerificationSatisfied(emailVerified: boolean) {
  return emailVerified || isDevelopmentEmailVerificationBypassed()
}

const isPublicDevelopmentEmailVerificationBypassed =
  isDevelopmentEmailVerificationBypassed

export {
  isDevelopmentEmailVerificationBypassed,
  isEmailVerificationSatisfied,
  isPublicDevelopmentEmailVerificationBypassed,
}

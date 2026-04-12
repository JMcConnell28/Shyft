function isDevelopmentEmailVerificationBypassed() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_EMAIL_VERIFICATION === "true"
  )
}

function isEmailVerificationSatisfied(emailVerified: boolean) {
  return emailVerified || isDevelopmentEmailVerificationBypassed()
}

function isPublicDevelopmentEmailVerificationBypassed() {
  return (
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_EMAIL_VERIFICATION === "true"
  )
}

export {
  isDevelopmentEmailVerificationBypassed,
  isEmailVerificationSatisfied,
  isPublicDevelopmentEmailVerificationBypassed,
}

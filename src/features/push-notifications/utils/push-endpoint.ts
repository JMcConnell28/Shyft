function isSupportedPushEndpoint(value: string): boolean {
  // Reject parser ambiguity before either URL parser or the HTTP client sees it.
  if (/[\p{Cc}\s\\]/u.test(value)) return false
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      !value.includes("#") &&
      (url.hostname === "fcm.googleapis.com" ||
        url.hostname === "updates.push.services.mozilla.com" ||
        url.hostname.endsWith(".push.apple.com") ||
        url.hostname.endsWith(".notify.windows.com"))
    )
  } catch {
    return false
  }
}

class BlockedPushEndpointError extends Error {
  constructor() {
    super("This notification endpoint is not supported.")
    this.name = "BlockedPushEndpointError"
  }
}

export { BlockedPushEndpointError, isSupportedPushEndpoint }

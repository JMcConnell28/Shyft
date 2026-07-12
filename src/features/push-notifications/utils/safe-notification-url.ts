function getSafeNotificationPath(value: unknown, fallback = "/dashboard") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback
  }

  try {
    const url = new URL(value, "https://rocketrota.invalid")
    return url.origin === "https://rocketrota.invalid"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback
  } catch {
    return fallback
  }
}

export { getSafeNotificationPath }

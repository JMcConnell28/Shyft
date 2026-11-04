function composeResponseSecurityHeaders(
  responseHeaders: Headers,
  baseline: Headers
): Headers {
  const headers = new Headers(baseline)
  const policyHeader = "Content-Security-Policy"
  const routePolicy = responseHeaders.get(policyHeader)
  // Browsers enforce both policies, preserving the stricter download sandbox.
  if (routePolicy && routePolicy !== headers.get(policyHeader)) {
    headers.append(policyHeader, routePolicy)
  }
  return headers
}

export { composeResponseSecurityHeaders }

type SecurityHeaderOptions = { nonce: string; production: boolean }

function createSecurityHeaders({
  nonce,
  production,
}: SecurityHeaderOptions): Headers {
  const policy = [
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    ...(production
      ? [
          "default-src 'self'",
          `script-src 'self' 'nonce-${nonce}'`,
          "script-src-attr 'none'",
          // Base UI, drag/drop and charts use inline styles; scripts still require a nonce.
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "worker-src 'self' blob:",
          "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
        ]
      : []),
  ].join("; ")

  return new Headers({
    "Content-Security-Policy": policy,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Dynamic HTML contains per-request nonces and may contain session data.
    // Nitro serves static assets separately with their existing cache rules.
    "Cache-Control": "private, no-store",
    "CDN-Cache-Control": "no-store",
    "Surrogate-Control": "no-store",
  })
}

export { createSecurityHeaders }

// No application client uses these endpoints. Reject without parsing a body or
// writing data: browser payloads cannot establish a trusted audit identity.
function rejectRetiredTelemetry(): Response {
  return Response.json(
    { error: "Public telemetry ingestion has been retired." },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  )
}

export { rejectRetiredTelemetry }

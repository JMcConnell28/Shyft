import "@tanstack/react-start/server-only"
import { readReleasedPersonalDataResponse } from "@rocketrota/db/privacy"
import { downloadPrivacyResponseSchema } from "@rocketrota/shared/privacy"
import { requirePersonalDataSession } from "./access"
import { renderPersonalDataReport } from "./report"

const downloadHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; sandbox",
}
async function downloadPersonalData(
  request: Request,
  id: string
): Promise<Response> {
  const parsed = downloadPrivacyResponseSchema.safeParse({
    id,
    format: new URL(request.url).searchParams.get("format") ?? "json",
  })
  if (!parsed.success)
    return new Response("Invalid download request.", {
      status: 400,
      headers: downloadHeaders,
    })
  try {
    const { user } = await requirePersonalDataSession()
    const response = await readReleasedPersonalDataResponse(
      parsed.data.id,
      user.id
    )
    const html = parsed.data.format === "html"
    return new Response(
      html
        ? renderPersonalDataReport(response)
        : JSON.stringify(response, null, 2),
      {
        headers: {
          ...downloadHeaders,
          "Content-Type": html
            ? "text/html; charset=utf-8"
            : "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="rocketrota-personal-data-${parsed.data.id}.${parsed.data.format}"`,
        },
      }
    )
  } catch {
    console.warn("Personal data download could not be served", {
      requestId: parsed.data.id,
    })
    return new Response(
      "This download is unavailable. Sign in with the verified account that made the request, or contact us for help.",
      { status: 404, headers: downloadHeaders }
    )
  }
}
export { downloadPersonalData, downloadHeaders }

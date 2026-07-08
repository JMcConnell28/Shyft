import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type { ErrorReport, ErrorsPageData } from "@/features/errors/types"

type ErrorReportRow = {
  fingerprint: string
  first_seen_at: Date | string
  id: string
  last_seen_at: Date | string
  message: string
  occurrence_count: number
  route_path: string | null
  severity: string
  source: string
  status: string
}

async function listErrorReports(): Promise<ErrorsPageData> {
  const rows = await queryMany<ErrorReportRow>(
    `select id,
            fingerprint,
            source,
            severity,
            status,
            message,
            route_path,
            first_seen_at,
            last_seen_at,
            occurrence_count
     from admin_private.app_error_reports
     order by last_seen_at desc
     limit 200`,
  )

  return {
    errors: rows.map(mapError),
  }
}

function mapError(row: ErrorReportRow): ErrorReport {
  return {
    fingerprint: row.fingerprint,
    firstSeenAt: new Date(row.first_seen_at).toISOString(),
    id: row.id,
    lastSeenAt: new Date(row.last_seen_at).toISOString(),
    message: row.message,
    occurrenceCount: row.occurrence_count,
    routePath: row.route_path,
    severity: row.severity,
    source: row.source,
    status: row.status,
  }
}

export { listErrorReports }

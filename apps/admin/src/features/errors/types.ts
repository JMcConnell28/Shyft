type ErrorReport = {
  firstSeenAt: string
  fingerprint: string
  id: string
  lastSeenAt: string
  message: string
  occurrenceCount: number
  routePath: string | null
  severity: string
  source: string
  status: string
}

type ErrorsPageData = {
  errors: ErrorReport[]
}

export type { ErrorReport, ErrorsPageData }

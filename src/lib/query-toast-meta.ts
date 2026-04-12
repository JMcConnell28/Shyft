type AppMutationMeta = {
  successMessage?: string
  errorMessage?: string
  disableErrorToast?: boolean
  disableSuccessToast?: boolean
}

type AppQueryMeta = {
  errorMessage?: string
  disableErrorToast?: boolean
}

function getAppMutationMeta(meta: unknown): AppMutationMeta {
  return isRecord(meta) ? meta : {}
}

function getAppQueryMeta(meta: unknown): AppQueryMeta {
  return isRecord(meta) ? meta : {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export { getAppMutationMeta, getAppQueryMeta }
export type { AppMutationMeta, AppQueryMeta }

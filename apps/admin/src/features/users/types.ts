type AdminUserSearchResult = {
  deactivatedAt: string | null
  email: string
  emailVerified: boolean
  id: string
  lastLoginAt: string | null
  name: string
  roleSummary: string
}

type UsersPageData = {
  users: AdminUserSearchResult[]
}

type ImpersonationLaunch = {
  expiresAt: string
  url: string
}

export type { AdminUserSearchResult, ImpersonationLaunch, UsersPageData }

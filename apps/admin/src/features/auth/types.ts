import type { AdminRole } from "@rocketrota/shared/admin"

type AdminMembership = {
  disabledAt: string | null
  email: string
  name: string
  role: AdminRole
  twoFactorEnabled: boolean
  userId: string
}

export type { AdminMembership }

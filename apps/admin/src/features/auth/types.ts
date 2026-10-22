import type { AdminRole } from "@rocketrota/shared/admin"

type AdminMembership = {
  disabledAt: string | null
  email: string
  name: string
  role: AdminRole
  userId: string
}

export type { AdminMembership }

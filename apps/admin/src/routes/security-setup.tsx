import { createFileRoute, redirect } from "@tanstack/react-router"

import { AdminMfaSetup } from "@/features/auth/components/admin-mfa-setup"
import { getAdminAuthStatus } from "@/features/auth/server-fns"

export const Route = createFileRoute("/security-setup")({
  beforeLoad: async () => {
    const status = await getAdminAuthStatus()
    if (!status.authenticated) throw redirect({ to: "/login" })
    if (!status.needsTwoFactorSetup) throw redirect({ to: "/dashboard" })
  },
  component: AdminMfaSetup,
})

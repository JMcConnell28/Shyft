import { createFileRoute, redirect } from "@tanstack/react-router"

import { AdminLoginForm } from "@/features/auth/components/admin-login-form"
import { getAdminAuthStatus } from "@/features/auth/server-fns"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const status = await getAdminAuthStatus()
    if (status.authenticated)
      throw redirect({
        to: status.needsTwoFactorSetup ? "/security-setup" : "/dashboard",
      })
  },
  component: AdminLoginForm,
})

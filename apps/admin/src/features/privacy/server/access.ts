import "@tanstack/react-start/server-only"
import { setResponseHeader } from "@tanstack/react-start/server"
import { requireAdminPermission } from "@/features/auth/server/admin-session"

async function requirePrivacyAdmin() {
  setResponseHeader("Cache-Control", "private, no-store")
  const { membership } = await requireAdminPermission("privacy.manage")
  return membership.userId
}
export { requirePrivacyAdmin }

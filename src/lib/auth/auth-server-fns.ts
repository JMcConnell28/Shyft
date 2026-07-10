import { createServerFn } from "@tanstack/react-start"

import {
  getOrgCapabilitiesInputSchema,
  getWorkspaceCapabilitiesInputSchema,
} from "@/lib/auth/auth-schemas"
import { ensureSession } from "@/lib/auth-server"

const getOrgCapabilities = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => getOrgCapabilitiesInputSchema.parse(input))
  .handler(async ({ data }) => {
    const session = await ensureSession()

    if (data.userId !== session.user.id) {
      throw new Error("Unauthorized")
    }

    const module = await import("@/lib/auth/get-org-capabilities")
    return module.getOrgCapabilities(data)
  })

const getWorkspaceCapabilities = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getWorkspaceCapabilitiesInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession()

    if (data.userId !== session.user.id) {
      throw new Error("Unauthorized")
    }

    const [{ getOrgCapabilitiesForRole }, { getLocationRole }, { getOrganizationRole }] =
      await Promise.all([
        import("@/lib/auth/get-org-capabilities"),
        import("@/lib/auth/has-location-permission"),
        import("@/lib/auth/has-org-permission"),
      ])
    const role = data.locationId
      ? await getLocationRole(data.locationId, session.user.id)
      : data.organizationId
        ? await getOrganizationRole(data.organizationId, session.user.id)
        : null

    return getOrgCapabilitiesForRole(role)
  })

export { getOrgCapabilities, getWorkspaceCapabilities }

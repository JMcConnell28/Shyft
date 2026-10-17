import { z } from "zod"
import type { OrganizationRole } from "@/lib/auth/permissions"
// eslint-disable-next-line no-duplicate-imports
import { roles } from "@/lib/auth/permissions"

const organizationRoleSchema = z.custom<OrganizationRole>(
  (value) => typeof value === "string" && Object.hasOwn(roles, value)
)
const membershipRowsSchema = z.array(z.object({ role: z.unknown() })).max(1)

export { membershipRowsSchema, organizationRoleSchema }

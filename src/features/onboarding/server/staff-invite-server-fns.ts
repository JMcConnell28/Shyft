import { createServerFn } from "@tanstack/react-start"
import {
  acceptInviteSchema,
  staffInviteSelectionSchema,
} from "../schemas/onboarding-schemas"
import { staffInviteScopeSchema } from "../schemas/staff-invite-schemas"

const createStaffInviteLink = createServerFn({ method: "POST" })
  .validator((input: unknown) => staffInviteSelectionSchema.parse(input))
  .handler(async ({ data }) =>
    (await import("./staff-invite-create")).createStaffInviteLink(data)
  )

const ensureActiveStaffInviteLink = createServerFn({ method: "POST" })
  .validator((input: unknown) => staffInviteSelectionSchema.parse(input))
  .handler(async ({ data }) =>
    (await import("./staff-invite-create")).createStaffInviteLink(data, true)
  )

const getActiveStaffInviteLink = createServerFn({ method: "GET" })
  .validator((input: unknown) => staffInviteScopeSchema.parse(input))
  .handler(async ({ data }) =>
    (await import("./staff-invite-queries")).getActiveStaffInviteLink(
      data.organizationId
    )
  )

const getStaffInvitePreview = createServerFn({ method: "GET" })
  .validator((input: unknown) => acceptInviteSchema.parse(input))
  .handler(async ({ data }) =>
    (await import("./staff-invite-queries")).getStaffInvitePreview(data.token)
  )

const acceptStaffInvite = createServerFn({ method: "POST" })
  .validator((input: unknown) => acceptInviteSchema.parse(input))
  .handler(async ({ data }) =>
    (await import("./staff-invite-accept")).acceptStaffInvite(data.token)
  )

export {
  createStaffInviteLink,
  ensureActiveStaffInviteLink,
  getActiveStaffInviteLink,
  getStaffInvitePreview,
  acceptStaffInvite,
}

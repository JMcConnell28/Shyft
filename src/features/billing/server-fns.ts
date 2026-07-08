import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { timeAttendanceAddonInputSchema } from "@/features/billing/schemas/time-attendance-addon-schemas"
import { requireWorkspaceBillingPermission } from "@/features/billing/server/permissions"
import { isSafeAppReturnPath } from "@/features/billing/server/urls"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"

const workspaceReferenceSchema = z
  .object({
    organizationId: z.string().trim().min(1).optional(),
    locationId: z.string().uuid().optional(),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const trialTestingSchema = z
  .object({
    organizationId: z.string().trim().min(1).optional(),
    locationId: z.string().uuid().optional(),
    state: z.enum(["active", "ending-soon", "expired", "reset"]),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const returnPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .refine(isSafeAppReturnPath, "Return path must stay inside the app.")
  .optional()

const checkoutSchema = workspaceReferenceSchema.extend({
  returnPath: returnPathSchema,
})

const billingStatusSchema = workspaceReferenceSchema.extend({
  checkoutSessionId: z.string().trim().startsWith("cs_").optional(),
})

const portalSchema = workspaceReferenceSchema.extend({
  returnPath: returnPathSchema,
})

const organizationBillingOverviewSchema = z.object({
  organizationId: z.string().trim().min(1),
})

const setTrialForTesting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => trialTestingSchema.parse(input))
  .handler(async ({ data }) => {
    if (process.env.NODE_ENV !== "development") {
      throw new Error(
        "Trial testing controls are only available in development."
      )
    }

    const { session } = await requireVerifiedSessionOrThrow()

    if (data.organizationId) {
      await requireWorkspaceBillingPermission({
        organizationId: data.organizationId,
        userId: session.user.id,
      })
    } else if (data.locationId) {
      await requireWorkspaceBillingPermission({
        locationId: data.locationId,
        userId: session.user.id,
      })
    }

    const module = await import("@/features/billing/server/trials")
    return module.setWorkspaceTrialForDevelopment(data)
  })

const startSubscriptionCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()

    await requireWorkspaceBillingPermission({
      organizationId: data.organizationId,
      locationId: data.locationId,
      userId: session.user.id,
    })

    const module = await import("@/features/billing/server/checkout")

    return module.createSubscriptionCheckoutSession({
      organizationId: data.organizationId,
      locationId: data.locationId,
      returnPath: data.returnPath,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    })
  })

const getWorkspaceBillingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => billingStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()

    await requireWorkspaceBillingPermission({
      organizationId: data.organizationId,
      locationId: data.locationId,
      userId: session.user.id,
    })

    const billingAccounts =
      await import("@/features/billing/server/billing-accounts")
    const billing = data.organizationId
      ? await billingAccounts.getOrganizationBillingAccess(data.organizationId)
      : await billingAccounts.getLocationBillingAccess(data.locationId ?? "")
    const subscriptions =
      await import("@/features/billing/server/subscriptions")

    if (data.checkoutSessionId && billing) {
      await subscriptions.syncCheckoutSessionForBillingAccount({
        checkoutSessionId: data.checkoutSessionId,
        billingAccountId: billing.billingAccountId,
      })

      return data.organizationId
        ? await billingAccounts.getOrganizationBillingAccess(
            data.organizationId
          )
        : await billingAccounts.getLocationBillingAccess(data.locationId ?? "")
    }

    if (billing?.stripeCustomerId) {
      await subscriptions.refreshStripeSubscriptionsForBillingAccount({
        billingAccountId: billing.billingAccountId,
        stripeCustomerId: billing.stripeCustomerId,
      })

      return data.organizationId
        ? await billingAccounts.getOrganizationBillingAccess(
            data.organizationId
          )
        : await billingAccounts.getLocationBillingAccess(data.locationId ?? "")
    }

    return billing
  })

const startBillingPortal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => portalSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()

    await requireWorkspaceBillingPermission({
      organizationId: data.organizationId,
      locationId: data.locationId,
      userId: session.user.id,
    })

    const billingAccounts =
      await import("@/features/billing/server/billing-accounts")
    const billing = data.organizationId
      ? await billingAccounts.getOrganizationBillingAccess(data.organizationId)
      : await billingAccounts.getLocationBillingAccess(data.locationId ?? "")

    if (!billing?.stripeCustomerId) {
      throw new Error("No Stripe customer exists for this workspace yet.")
    }

    const portal = await import("@/features/billing/server/portal")

    return portal.createBillingPortalSession({
      stripeCustomerId: billing.stripeCustomerId,
      returnPath: data.returnPath,
    })
  })

const updateTimeAttendanceAddon = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    timeAttendanceAddonInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()

    await requireWorkspaceBillingPermission({
      locationId: data.locationId,
      userId: session.user.id,
    })

    const addons = await import("@/features/billing/server/addons")
    if (data.action === "activate") {
      return addons.activateTimeAttendance({
        locationId: data.locationId,
        confirmationAccepted: data.confirmationAccepted === true,
        deliveryAddress: data.deliveryAddress,
      })
    }

    return data.action === "keep"
      ? addons.keepTimeAttendance(data.locationId)
      : addons.cancelTimeAttendance(data.locationId)
  })

const getOrganizationBillingOverview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    organizationBillingOverviewSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const { getOrganizationRole } =
      await import("@/lib/auth/has-org-permission")
    const role = await getOrganizationRole(data.organizationId, session.user.id)

    if (!role || !["owner", "admin"].includes(role)) {
      throw new Error(
        "You do not have permission to view organization billing."
      )
    }

    const overview = await import("@/features/billing/server/overview")
    return overview.getOrganizationBillingOverview(data.organizationId)
  })

export {
  getWorkspaceBillingStatus,
  getOrganizationBillingOverview,
  setTrialForTesting,
  startBillingPortal,
  startSubscriptionCheckout,
  updateTimeAttendanceAddon,
}

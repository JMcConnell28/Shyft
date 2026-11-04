import "@tanstack/react-start/server-only"
import "reflect-metadata"

import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { twoFactor } from "better-auth/plugins"

import { getAdminAuthDatabase } from "@/lib/admin-auth-database"
import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"
import {
  requireAdminMembership,
  revokeAdminSessionsForUser,
} from "@/features/auth/server/admin-session"
import { adminUserAdditionalFields } from "@/features/auth/server/admin-user-fields"
import { requireAllowedAdminProfileUpdate } from "@/features/auth/server/require-admin-profile-update"

const adminAuthBaseUrl =
  getOptionalEnv("ADMIN_BETTER_AUTH_URL") ?? "http://localhost:3001"

const auth = betterAuth({
  appName: "RocketRota Admin",
  baseURL: adminAuthBaseUrl,
  secret: getRequiredEnv("ADMIN_BETTER_AUTH_SECRET"),
  database: getAdminAuthDatabase(),
  user: {
    modelName: "admin_user",
    additionalFields: adminUserAdditionalFields,
  },
  session: {
    modelName: "admin_session",
    cookieCache: { enabled: false },
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 30,
  },
  account: {
    modelName: "admin_account",
  },
  verification: {
    modelName: "admin_verification",
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    requireEmailVerification: false,
  },
  hooks: {
    before: createAuthMiddleware((ctx) => {
      if (ctx.path === "/update-user") {
        requireAllowedAdminProfileUpdate(ctx.body)
      }
      if (ctx.path === "/two-factor/disable") {
        throw new APIError("FORBIDDEN", {
          message: "Admin MFA can only be reset by an authorized operator.",
        })
      }
      if (ctx.path.startsWith("/two-factor/") && ctx.body?.trustDevice) {
        throw new APIError("FORBIDDEN", {
          message: "Admin sign-in requires a second factor on every device.",
        })
      }
      return Promise.resolve()
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: () => {
          throw new APIError("FORBIDDEN", {
            message:
              "Admin accounts must be provisioned by an authorized operator.",
          })
        },
      },
      update: {
        after: async (user, context) => {
          // Enrollment creates its replacement session after this update. Retire
          // every older password-only session before that replacement is issued.
          if (user.disabledAt || context?.path === "/two-factor/verify-totp") {
            await revokeAdminSessionsForUser(user.id)
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          await requireAdminMembership(session.userId)
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "rocketrota-admin",
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
      secure: adminAuthBaseUrl.startsWith("https://"),
    },
  },
  rateLimit: {
    enabled: true,
    customRules: { "/sign-in/email": { window: 300, max: 10 } },
  },
  plugins: [
    twoFactor({
      issuer: "RocketRota Admin",
      twoFactorTable: "admin_two_factor",
      trustDeviceMaxAge: 0,
    }),
    tanstackStartCookies(),
  ],
})

export { auth }

import "@tanstack/react-start/server-only"
import "reflect-metadata"

import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import { getAdminAuthDatabase } from "@/lib/admin-auth-database"
import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"
import {
  ensureAdminMembershipForUser,
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
    requireEmailVerification: false,
  },
  hooks: {
    before: createAuthMiddleware((ctx) => {
      if (ctx.path === "/update-user") {
        requireAllowedAdminProfileUpdate(ctx.body)
      }
      return Promise.resolve()
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: (user) => {
          if (!isBootstrapAdminEmail(String(user.email))) {
            throw new APIError("FORBIDDEN", {
              message: "Admin accounts must be provisioned before sign in.",
            })
          }

          return Promise.resolve({
            data: {
              role: "owner",
            },
          })
        },
        after: async (user) => {
          await ensureAdminMembershipForUser({
            email: user.email,
            userId: user.id,
          })
        },
      },
      update: {
        after: async (user) => {
          if (user.disabledAt) {
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
  plugins: [tanstackStartCookies()],
})

function isBootstrapAdminEmail(email: string) {
  const allowedEmails = (getOptionalEnv("ADMIN_BOOTSTRAP_EMAILS") ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  return allowedEmails.includes(email.toLowerCase())
}

export { auth }

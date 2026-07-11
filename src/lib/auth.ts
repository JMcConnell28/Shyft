import "@tanstack/react-start/server-only"
import "reflect-metadata"

import { betterAuth } from "better-auth"
import { passkey } from "@better-auth/passkey"
import { stripe as stripePlugin } from "@better-auth/stripe"
import { organization } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import Stripe from "stripe"

import { ac, roles } from "@/lib/auth/permissions"
import { authUserAdditionalFields } from "@/lib/auth-fields"
import { getDatabase } from "@/lib/db"
import { isDevelopmentEmailVerificationBypassed } from "@/lib/email-verification"
import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"
import {
  sendOrganizationInvitationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/features/email/server/auth-emails"

const authBaseUrl = getOptionalEnv("BETTER_AUTH_URL") ?? "http://localhost:3000"
const authOrigin = new URL(authBaseUrl).origin
const relyingPartyId = new URL(authBaseUrl).hostname
const isEmailVerificationBypassed = isDevelopmentEmailVerificationBypassed()
const stripeSecretKey = getOptionalEnv("STRIPE_SECRET_KEY")
const stripeWebhookSecret = getOptionalEnv("STRIPE_WEBHOOK_SECRET")
const stripeAuthPlugins =
  stripeSecretKey && stripeWebhookSecret
    ? [
        stripePlugin({
          stripeClient: new Stripe(stripeSecretKey, {
            appInfo: {
              name: "RocketRota",
            },
          }),
          stripeWebhookSecret,
          createCustomerOnSignUp: false,
          subscription: {
            enabled: true,
            plans: [],
            requireEmailVerification: true,
          },
          organization: {
            enabled: true,
          },
        }),
      ]
    : []

const auth = betterAuth({
  baseURL: authBaseUrl,
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  database: getDatabase(),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },
  user: {
    additionalFields: authUserAdditionalFields,
  },
  emailVerification: {
    sendOnSignUp: !isEmailVerificationBypassed,
    sendOnSignIn: !isEmailVerificationBypassed,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        to: user.email,
        userName: user.name,
        verificationUrl: url,
      })
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: url,
        userName: user.name,
      })
    },
  },
  plugins: [
    organization({
      ac,
      roles,
      requireEmailVerificationOnInvitation: !isEmailVerificationBypassed,
      sendInvitationEmail: async ({ email, id, organization, role }) => {
        const invitationUrl = `${authOrigin}/accept-invitation/${id}`

        await sendOrganizationInvitationEmail({
          to: email,
          invitationUrl,
          organizationName: organization.name,
          role,
        })
      },
    }),
    passkey({
      rpID: relyingPartyId,
      rpName: "RocketRota",
      origin: authOrigin,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
    }),
    ...stripeAuthPlugins,
    // Better Auth recommends this as the final plugin for TanStack Start.
    tanstackStartCookies(),
  ],
  trustedOrigins: [
    "https://rocketrota.com",
    "https://www.rocketrota.com",
    "http://localhost:3000",
  ],
})

export { auth }

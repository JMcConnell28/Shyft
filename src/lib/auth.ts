import { betterAuth } from "better-auth"
import { passkey } from "@better-auth/passkey"
import { organization } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import { ac, roles } from "@/lib/auth/permissions"
import { getDatabase } from "@/lib/db"
import { isDevelopmentEmailVerificationBypassed } from "@/lib/email-verification"
import { sendTransactionalEmail } from "@/lib/email"
import { getRequiredEnv } from "@/lib/env"

const authBaseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
const authOrigin = new URL(authBaseUrl).origin
const relyingPartyId = new URL(authBaseUrl).hostname
const isEmailVerificationBypassed = isDevelopmentEmailVerificationBypassed()

const auth = betterAuth({
  baseURL: authBaseUrl,
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  database: getDatabase(),
  emailVerification: {
    sendOnSignUp: !isEmailVerificationBypassed,
    sendOnSignIn: !isEmailVerificationBypassed,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Verify your Shyft account",
        html: `
          <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <p style="margin: 0 0 12px;">Hi ${user.name},</p>
            <p style="margin: 0 0 16px;">
              Verify your email to finish setting up Shyft and join your workplace.
            </p>
            <p style="margin: 0 0 24px;">
              <a
                href="${url}"
                style="display: inline-block; border-radius: 999px; background: #0f172a; color: white; padding: 12px 18px; text-decoration: none; font-weight: 600;"
              >
                Verify email
              </a>
            </p>
            <p style="margin: 0; color: #475569;">
              If the button does not work, open this link:
            </p>
            <p style="margin: 8px 0 0; color: #2563eb; word-break: break-word;">${url}</p>
          </div>
        `,
        text: `Verify your Shyft account by opening this link: ${url}`,
      })
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: !isEmailVerificationBypassed,
  },
  plugins: [
    organization({
      ac,
      roles,
      requireEmailVerificationOnInvitation: !isEmailVerificationBypassed,
      sendInvitationEmail: async ({ email, id, organization, role }) => {
        const invitationUrl = `${authOrigin}/accept-invitation/${id}`

        await sendTransactionalEmail({
          to: email,
          subject: `You were invited to ${organization.name} on Shyft`,
          html: `
            <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0f172a;">
              <p style="margin: 0 0 12px;">You have been invited to join ${organization.name} on Shyft.</p>
              <p style="margin: 0 0 12px;">Role: <strong>${role}</strong></p>
              <p style="margin: 0 0 24px;">
                <a
                  href="${invitationUrl}"
                  style="display: inline-block; border-radius: 999px; background: #0f172a; color: white; padding: 12px 18px; text-decoration: none; font-weight: 600;"
                >
                  Accept invitation
                </a>
              </p>
              <p style="margin: 0; color: #475569;">
                Or open this link:
              </p>
              <p style="margin: 8px 0 0; color: #2563eb; word-break: break-word;">${invitationUrl}</p>
            </div>
          `,
          text: `You were invited to ${organization.name} on Shyft. Accept the invitation here: ${invitationUrl}`,
        })
      },
    }),
    passkey({
      rpID: relyingPartyId,
      rpName: "Shyft",
      origin: authOrigin,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
    }),
    // Better Auth recommends this as the final plugin for TanStack Start.
    tanstackStartCookies(),
  ],
})

export { auth }

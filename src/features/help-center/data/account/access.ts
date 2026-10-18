import type { HelpPage } from "@/features/help-center/types"

const accountAccessPages: ReadonlyArray<HelpPage> = [
  {
    slug: "account/join-a-workplace",
    title: "Join a workplace",
    description:
      "Use your invitation or staff joining link and understand approval status.",
    categoryId: "account",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "sign up",
      "register",
      "invite",
      "token",
      "pending approval",
      "verify email",
      "rejected",
    ],
    relatedSlugs: [
      "account/workplaces-and-profile",
      "troubleshooting/missing-rota-or-access",
    ],
    sections: [
      {
        type: "steps",
        title: "Connect your account",
        items: [
          "Ask your manager for the workplace invitation or staff joining link.",
          "Sign in to your existing RocketRota account or create one with the email address you intend to use. Complete email verification if requested.",
          "Follow the invitation. If you are on the Join workplace page, enter the invitation information supplied by your manager.",
          "If the page says your request needs approval, wait for an authorised manager to review it. Creating an account alone does not give you workplace access.",
          "After approval, choose the workplace and check that your published shifts appear.",
        ],
      },
      {
        type: "callout",
        title: "Still waiting or unable to join?",
        body: "Tell your manager the email address you used and the status or error shown. They can check the invitation, pending request and employee account link. Ask them to resolve an incorrect or rejected request before creating another account.",
      },
    ],
  },
  {
    slug: "account/sign-in-and-password",
    title: "Sign in, reset or change your password",
    description: "Recover account access and keep your password up to date.",
    categoryId: "account",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "login",
      "log in",
      "forgot password",
      "reset email",
      "verification",
      "sessions",
      "logout",
    ],
    relatedSlugs: [
      "account/face-id-and-fingerprint",
      "account/join-a-workplace",
      "troubleshooting/get-help",
    ],
    sections: [
      {
        type: "steps",
        title: "Recover a forgotten password",
        items: [
          "Open the sign-in page and select the forgotten password option.",
          "Enter the email address used for your RocketRota account and check its inbox and junk folder for the reset message.",
          "Open the reset link and follow the password requirements shown. If the link is no longer valid, request a new one.",
          "Return to sign-in with the new password, then select your workplace if needed.",
        ],
      },
      {
        type: "steps",
        title: "Change a password while signed in",
        items: [
          "Open Account → Password.",
          "Enter your current password, then the new password and its confirmation.",
          "Save the change. Other signed-in sessions are signed out, so use the new password when signing in on those devices again.",
        ],
      },
      {
        type: "callout",
        title: "Account or workplace access?",
        body: "A successful sign-in does not approve a pending workplace request. If you can sign in but cannot see your workplace, ask your manager to check membership. Never share your password or a reset link when asking for help.",
      },
    ],
  },
  {
    slug: "account/workplaces-and-profile",
    title: "Switch workplaces and check your profile",
    description:
      "Choose the right workplace and find the personal details linked to your account.",
    categoryId: "account",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "organisation",
      "organization",
      "company",
      "name",
      "email",
      "verified",
      "personal details",
      "log out",
    ],
    relatedSlugs: ["account/join-a-workplace", "account/sign-in-and-password"],
    sections: [
      {
        type: "steps",
        title: "Choose your workplace",
        items: [
          "Open Account and find Workplaces.",
          "Select the workplace you want to use. Check it before viewing shifts, clocking or responding to requests.",
          "If another workplace is missing, use its invitation or ask that workplace's manager to check your access.",
        ],
      },
      {
        type: "paragraphs",
        title: "Personal details and corrections",
        body: [
          "Account → Personal details shows the name and email attached to your account, including email verification status.",
          "These details are read-only here. If your name needs correcting, ask your manager to submit a Support request. For an incorrect email or an account linking problem, ask your manager to help check the account before creating a duplicate.",
        ],
      },
      {
        type: "callout",
        title: "Using a shared device",
        body: "Use the account's log-out control when you finish. Before clocking or checking personal records on any device, confirm that the signed-in account is yours.",
      },
    ],
  },
]

export { accountAccessPages }

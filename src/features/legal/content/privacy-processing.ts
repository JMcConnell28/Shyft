import type { LegalDocumentSection } from "@/features/legal/types"

const privacyProcessingSections: ReadonlyArray<LegalDocumentSection> = [
  {
    title: "Why we use information and our lawful bases",
    paragraphs: [
      "For processing where RocketRota is controller, we use the following lawful bases. The workplace is responsible for identifying the bases for its own workforce processing; accepting our Terms or reading this notice is not blanket consent to every use of personal information.",
    ],
    subsections: [
      {
        title: "Providing a service you request",
        paragraphs: [
          "Where we have a contract with you as an individual, we rely on contract to provide and administer that service or take steps you request before entering into it. This can include your account, a sole-trader subscription, billing and handling service enquiries. When you act for a business customer, we generally rely on legitimate interests to manage that business relationship rather than treating its contract as a contract with you personally.",
        ],
      },
      {
        title: "Running and protecting RocketRota",
        paragraphs: [
          "We rely on legitimate interests to administer business contacts and user access, deliver requested operational messages, investigate faults and misuse, provide support, maintain the Service and establish or defend legal claims. Those interests are operating a reliable service, protecting users and managing customer relationships. We must balance them against your interests and rights, and you may object where this basis applies.",
        ],
      },
      {
        title: "Legal duties and choices",
        paragraphs: [
          "We rely on legal obligation where necessary for applicable accounting, tax, regulatory and other legal duties. Where we rely on consent for an optional activity, we will explain the choice when asking and you can withdraw it. Browser permission for push notifications can be withdrawn through your device or browser settings. Signing up does not itself subscribe you to promotional emails.",
          "We need certain account and billing information to provide the requested service or meet legal obligations. If you do not supply required information, we may be unable to create the account, process a subscription or resolve the request. Optional information and notification choices are not required for every feature.",
        ],
      },
    ],
  },
  {
    title: "Who can receive information",
    paragraphs: [
      "Workforce information is made available within your workplace through the roles, permissions and features it uses. Authorised RocketRota operators may access information where needed for support, administration, security or lawful instructions. Your workplace may download files and share them with its payroll provider or other advisers; it is responsible for that subsequent use.",
      "We use infrastructure, deployment, communications and payment providers as described below. Information may also be disclosed to professional advisers, authorities or courts where necessary and lawful, or to a prospective business successor under appropriate safeguards. We do not sell personal information or use it to build advertising profiles.",
      "Browser and operating-system push services handle delivery information when you enable notifications. If you contact our listed Gmail address once activated, Google also processes that correspondence as the email provider. Avoid sending sensitive workforce records by ordinary email; an appropriate method should be agreed for any such request.",
    ],
  },
  {
    title: "Our service providers",
    paragraphs: [
      "The following providers support the Service. A primary hosting country does not necessarily describe every support, administration or onward-processing location. Providers may also act as independent controllers for their own account, security, billing or legal purposes.",
    ],
    subsections: [
      {
        title: "Hosting and deployment",
        paragraphs: [
          "netcup GmbH hosts the application server in Germany. Supabase Pte. Ltd. provides the hosted database, with the primary RocketRota project in Ireland. coolLabs Solutions Kft. provides Coolify Cloud for deployment management and server access; this can involve deployment configuration and access to application logs. Coolify Cloud's full relevant processing locations and contractual arrangements are being confirmed before launch.",
        ],
        links: [
          {
            label: "netcup privacy information",
            href: "https://www.netcup.com/en/contact/data-privacy",
          },
          {
            label: "Supabase privacy information",
            href: "https://supabase.com/privacy",
          },
          {
            label: "coolLabs privacy information",
            href: "https://coollabs.io/privacy-policy",
          },
        ],
      },
      {
        title: "Email and payments",
        paragraphs: [
          "Plus Five Five, Inc., trading as Resend, delivers transactional emails and processes recipient addresses, message content and delivery information, with primary processing in the United States. Stripe handles checkout, subscription payments and related fraud-prevention and regulatory processing. Stripe receives payment information directly and provides billing references and status information to RocketRota.",
        ],
        links: [
          {
            label: "Resend privacy information",
            href: "https://resend.com/legal/privacy-policy",
          },
          {
            label: "Stripe privacy information",
            href: "https://stripe.com/privacy",
          },
        ],
      },
    ],
  },
  {
    title: "International processing",
    paragraphs: [
      "Using the providers above involves processing outside the United Kingdom, including primary database hosting in Ireland, application hosting in Germany and email processing in the United States. Support access, deployment management and onward processing can involve additional countries.",
      "Restricted transfers require an applicable UK adequacy regulation or appropriate safeguards, such as standard contractual clauses with the UK Addendum, together with any required assessment and supplementary measures. Supabase and Resend publish data-processing agreements containing contractual transfer safeguards. We are confirming the arrangements applicable to all our provider accounts before launch; this notice does not assert that every provider's processing stays in the UK or EU. Contact us for information about the safeguards applicable to your information.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "Application controls include authenticated accounts, session checks and organisation- and location-based permission checks. Passkeys are available, privileged service credentials are used in server-side code, and payment-card collection takes place through Stripe-hosted checkout. Access to personal information should be limited to the purposes described in this notice and the workplace's instructions.",
      "Production access, backup and recovery arrangements are still being verified before launch. We do not promise a particular backup frequency or recovery period in this draft. You and your workplace should protect credentials, manage access appropriately and keep downloaded files secure.",
    ],
  },
]

export { privacyProcessingSections }

import { legalBusinessDetails } from "@/features/legal/business-details"
import type { LegalDocumentSection } from "@/features/legal/types"

const privacyOverviewSections: ReadonlyArray<LegalDocumentSection> = [
  {
    title: "Who we are and how to contact us",
    paragraphs: [
      `RocketRota is provided by ${legalBusinessDetails.providerName}, a sole trader. This notice explains how personal information is handled when you visit our website, create an account, use a workplace or contact us. It covers our website and progressive web app.`,
      `Our intended privacy contact is ${legalBusinessDetails.contactEmail}. Our business postal address and activation of this mailbox are being finalised before launch. Until then, existing users can raise a privacy enquiry through in-app support. Please do not send identity documents or sensitive workforce records in an initial email or support message.`,
    ],
  },
  {
    title: "RocketRota and your workplace have different responsibilities",
    paragraphs: [
      "We act as a controller when we decide why and how to use information for our own account administration, business contacts, billing, security, support and legal obligations. The purposes and lawful bases below describe that processing under the UK GDPR and the Data Protection Act 2018, as amended.",
      "Your employer or the organisation running your workplace normally acts as controller for workforce information, such as rotas, pay rates and time records. RocketRota processes that information on its instructions as a processor under the processing terms in our Terms and Conditions. Your workplace decides what records to enter, who should have access and its employment-related purposes, lawful bases and retention requirements.",
      "Your workplace should provide its own workforce privacy information. Start with it for questions about attendance, payroll, rota decisions or workplace records. If you contact us about information it controls, we will pass the request to the appropriate workplace contact and assist as required; this does not remove your data-protection rights.",
    ],
  },
  {
    title: "Information we handle",
    paragraphs: [
      "The information involved depends on your role, the features your workplace enables and what you or your workplace provide.",
    ],
    subsections: [
      {
        title: "Accounts and sign-in",
        paragraphs: [
          "Names, email addresses, date of birth, account identifiers, verification status, password authentication records, sessions, workplace memberships, roles and preferences. Date of birth is currently required during registration. If you choose passkeys, we store the public credential and associated registration information; facial or fingerprint verification is handled by your device or passkey provider, and RocketRota does not receive your facial image or fingerprint template.",
        ],
      },
      {
        title: "Workforce and attendance records",
        paragraphs: [
          "Employee and payroll identifiers, employment and location assignments, staff groups, roles, pay-rate information, published and draft shifts, shift-swap requests, labour-cost calculations, timesheets, clock-in and clock-out times, payable-time calculations, reasons, notes and manager corrections. NFC clocking can associate a station or tag identifier and a scan attempt with an account and time record. The current clocking flow does not collect device GPS coordinates.",
          "Announcements, responses and poll votes may be associated with your account. Avoid entering unnecessary medical details, other special-category information or criminal-offence information in notes or messages. Your workplace must identify any additional legal conditions needed if it provides sensitive information and should use an appropriate system for that purpose.",
        ],
      },
      {
        title: "Billing and payments",
        paragraphs: [
          "Billing contacts and addresses, tax information where supplied, Stripe customer and payment references, subscription and invoice information, payment status and employee or add-on usage totals. Full card details are collected through Stripe-hosted checkout rather than stored by RocketRota.",
        ],
      },
      {
        title: "Support, notifications and technical information",
        paragraphs: [
          "Enquiries, support threads, bug reports and information you choose to include in them. If you enable push notifications, we store the subscription endpoint, delivery keys, expiry information where supplied and browser or device descriptions. Notifications may display workplace information on your device's lock screen according to its settings.",
          "Our services and hosting providers can process IP addresses, browser and device information, request times, routes, account or workplace identifiers, diagnostic errors and operational logs. Clocking audit records include a hash derived from the request IP address and browser information. Such hashes can still be personal information when linked to an account or other records.",
        ],
      },
    ],
  },
  {
    title: "Where information comes from",
    paragraphs: [
      "Information comes from you when you register, sign in, clock in or out, use the Service or contact us; from your workplace when it creates records, assigns access or updates information; and from activity recorded through the Service. Payment and delivery providers also return information needed to administer payments, email and notifications.",
      "Some workforce information may be entered before you create an account, for example when your workplace sets up an employee profile or sends an invitation. Ask your workplace which information it has supplied and why.",
    ],
  },
]

export { privacyOverviewSections }

import type { HelpPage } from "@/features/help-center/types"

const managerCommunicationPages: ReadonlyArray<HelpPage> = [
  {
    slug: "managers/shift-swap-approvals",
    title: "Review shift swaps and cover requests",
    description:
      "Check staffing and eligibility before approving a change to published assignments.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "2 min",
    keywords: [
      "approve",
      "deny",
      "pending manager",
      "overlap",
      "expired",
      "exchange",
    ],
    relatedSlugs: [
      "employees/shift-swaps",
      "managers/locations-and-rota-settings",
    ],
    sections: [
      {
        type: "steps",
        title: "Review a request",
        items: [
          "Open Shift swaps and check requests awaiting manager approval within your permitted locations.",
          "Review the rota, both employees and affected shifts. Check coverage, staff group eligibility and whether the proposed assignment would overlap other work.",
          "Approve or deny the request using the available controls. Approval rechecks the current shift details; a request that has become invalid may no longer be approvable.",
          "After approval, check the updated published assignments and make sure the affected employees understand the change.",
        ],
      },
      {
        type: "paragraphs",
        title: "Understand request status",
        body: [
          "A proposed swap first needs the colleague's response. A cover request stays open until someone offers to take it. These then move to manager review rather than changing the rota immediately.",
          "Denied, cancelled and expired requests leave the current assignment in place. Changes to shifts or request timing can make an older request invalid.",
        ],
      },
      {
        type: "callout",
        title: "No eligible shifts?",
        body: "Check that shift swaps are enabled in rota settings and that the rota is published. Only eligible shifts are offered; location, staff group and time restrictions can rule out a proposed exchange.",
      },
    ],
  },
  {
    slug: "managers/post-announcements",
    title: "Post announcements and polls",
    description:
      "Share a workplace update with the right audience and keep key messages easy to find.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "2 min",
    keywords: [
      "create",
      "news",
      "message",
      "pin",
      "archive",
      "poll",
      "notification",
      "audience",
    ],
    relatedSlugs: ["employees/announcements", "account/notifications"],
    sections: [
      {
        type: "steps",
        title: "Share an update",
        items: [
          "Open Announcements and use the new announcement control when your role allows it.",
          "Write a clear title and message. Choose the whole workplace or the permitted locations that need the update.",
          "Add a poll if you need responses, or pin the message when staff will need to refer to it regularly.",
          "Publish the announcement and check it in the feed. Edit it if the details change, or archive it when it is no longer current.",
        ],
      },
      {
        type: "paragraphs",
        title: "How notifications work",
        body: [
          "A new announcement can send a title preview to eligible staff who have enabled announcement notifications and device push. The author does not receive their own new-announcement push.",
          "Editing, pinning, archiving and poll activity do not send another new-announcement push. Use a new, relevant update if staff need a fresh message about a material change.",
        ],
      },
      {
        type: "callout",
        title: "Check the audience",
        body: "Select the right locations before posting. Announcements are not a substitute for publishing a changed rota or approving a shift request, and a push notification does not confirm that everyone has read the message.",
      },
    ],
  },
  {
    slug: "managers/billing",
    title: "Manage billing and feature access",
    description:
      "Find subscription status, usage, payment details and location attendance activation.",
    categoryId: "managers",
    audience: "For owners and billing administrators",
    readingTime: "2 min",
    keywords: [
      "subscription",
      "trial",
      "invoice",
      "payment method",
      "portal",
      "pricing",
      "usage",
      "read only",
      "Time & Attendance",
    ],
    relatedSlugs: [
      "managers/clocking-setup",
      "troubleshooting/missing-rota-or-access",
      "troubleshooting/get-help",
    ],
    sections: [
      {
        type: "steps",
        title: "Check the workplace subscription",
        items: [
          "An authorised owner or billing administrator can open Settings → Billing.",
          "Review the subscription status, trial information, payment method and current usage and pricing shown for the workplace.",
          "Use the billing management controls to open the payment portal for available payment method, invoice and subscription actions.",
          "If the app reports a billing-related restriction, follow the account's payment or subscription instructions and check the status again.",
        ],
      },
      {
        type: "paragraphs",
        title: "Attendance activation is per location",
        body: [
          "Core rota access and Time & Attendance activation are separate. A location's attendance service is activated through Settings → Clocking when its clocking station is ready.",
          "Read the activation confirmation before enabling employee clocking: it starts the location's attendance billing. Use the current billing screen for the actual plan, usage and prices that apply.",
        ],
      },
      {
        type: "callout",
        title: "Missing billing controls?",
        body: "General manager access does not automatically include billing administration. Ask the workplace owner or an authorised administrator to review payment issues or plan changes. Contact Support if the displayed status does not match the account.",
      },
    ],
  },
]

export { managerCommunicationPages }

import type { HelpPage } from "@/features/help-center/types"

const employeeCommunicationPages: ReadonlyArray<HelpPage> = [
  {
    slug: "employees/shift-swaps",
    title: "Swap a shift or request cover",
    description:
      "Ask a colleague to swap, put a shift up for cover or respond to a request.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "3 min",
    keywords: [
      "trade",
      "exchange",
      "offer cover",
      "accept",
      "decline",
      "cancel",
      "approval",
    ],
    relatedSlugs: ["employees/view-your-rota", "managers/shift-swap-approvals"],
    sections: [
      {
        type: "steps",
        title: "Create a request",
        items: [
          "Open Shift swaps and select New request.",
          "Choose the published rota and your shift. To exchange shifts, choose an eligible colleague's shift under Swap with and select Request swap.",
          "To ask someone to take your shift without an exchange, select Put up for cover.",
          "Follow the request's status. A colleague accepting a swap or offering cover sends it for manager approval.",
        ],
      },
      {
        type: "bullets",
        title: "Responding and tracking progress",
        items: [
          "Check incoming requests to accept or decline a proposed swap, or offer to take an available cover shift.",
          "You can cancel your own request while its status allows it. Expired, denied or cancelled requests do not change your assigned shift.",
          "Only eligible published shifts appear. The workplace must enable swaps; location, staff group, timing and overlap rules can limit your choices.",
        ],
      },
      {
        type: "callout",
        title: "Wait for approval",
        body: "An agreement between employees is not the final approval. Keep following your current published shift until the manager approves the change, then check the updated rota.",
      },
    ],
  },
  {
    slug: "employees/announcements",
    title: "Read announcements and answer polls",
    description:
      "Keep up with workplace updates, pinned messages and team polls.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "2 min",
    keywords: ["news", "messages", "unread", "read", "pinned", "vote"],
    relatedSlugs: ["account/notifications", "troubleshooting/notifications"],
    sections: [
      {
        type: "steps",
        title: "Catch up with your team",
        items: [
          "Open Announcements in the correct workplace.",
          "Use the unread or pinned filters to find updates that need your attention.",
          "Read the full announcement, answer any available poll and mark the message as read. Use Mark all as read only after reviewing the updates you need.",
        ],
      },
      {
        type: "paragraphs",
        title: "Which announcements you see",
        body: [
          "Announcements can be aimed at the whole workplace or selected locations. Your access determines which messages appear.",
          "Pinned messages stay easy to find. Polls collect responses within the announcement; they do not change your rota or approve a shift swap.",
        ],
      },
      {
        type: "callout",
        title: "Do not rely on push alone",
        body: "New announcements can send push notifications when your preferences and device permissions allow it. Edits, pins and poll activity do not send another new-announcement notification, so check the feed regularly.",
      },
    ],
  },
]

export { employeeCommunicationPages }

type SupportCategory = "support" | "bug" | "feature_request"
type SupportStatus = "open" | "waiting" | "resolved" | "closed"

type SupportThreadSummary = {
  id: string
  subject: string
  category: SupportCategory
  status: SupportStatus
  updatedAt: string
  unread: boolean
}

type SupportMessage = {
  id: string
  authorType: "user" | "admin" | "system"
  body: string
  createdAt: string
}

type SupportThreadDetail = SupportThreadSummary & {
  messages: Array<SupportMessage>
}

type SupportThreadPageData = {
  threads: Array<SupportThreadSummary>
  hasMore: boolean
}

type SupportNotifications = {
  threads: Array<SupportThreadSummary>
  unreadCount: number
}

export type {
  SupportCategory,
  SupportMessage,
  SupportNotifications,
  SupportStatus,
  SupportThreadDetail,
  SupportThreadPageData,
  SupportThreadSummary,
}

type SupportThread = {
  category: string
  createdAt: string
  customerName: string | null
  id: string
  locationName: string | null
  organizationName: string | null
  priority: string
  status: string
  subject: string
  updatedAt: string
  unread: boolean
}

type SupportMessage = {
  id: string
  authorType: "user" | "admin" | "system"
  body: string
  createdAt: string
}

type SupportThreadDetail = SupportThread & {
  messages: Array<SupportMessage>
}

type SupportPageData = {
  threads: SupportThread[]
  hasMore: boolean
}

export type {
  SupportMessage,
  SupportPageData,
  SupportThread,
  SupportThreadDetail,
}

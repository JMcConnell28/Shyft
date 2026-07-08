type SupportThread = {
  category: string
  createdAt: string
  createdByEmail: string | null
  id: string
  priority: string
  status: string
  subject: string
  updatedAt: string
}

type SupportPageData = {
  threads: SupportThread[]
}

export type { SupportPageData, SupportThread }

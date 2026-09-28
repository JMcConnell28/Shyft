type JoinRequestStatus = "pending" | "approved" | "denied"

type JoinRequest = {
  id: string
  organizationId: string
  organizationName: string
  organizationSlug: string
  locationName: string
  staffGroupName: string
  userName: string
  userEmail: string
  status: JoinRequestStatus
  createdAt: string
  decidedAt: string | null
}

export type { JoinRequest, JoinRequestStatus }

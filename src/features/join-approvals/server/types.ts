import type { JoinRequestStatus } from "@/features/join-approvals/types"

type LockedJoinRequest = {
  organization_id: string
  location_id: string | null
  staff_group_id: string | null
  user_id: string
  status: JoinRequestStatus
  name: string
  email: string
  dateOfBirth: string | null
}

export type { LockedJoinRequest }

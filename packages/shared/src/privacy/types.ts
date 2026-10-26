import type { z } from "zod"
import type {
  personalDataResponseSchema,
  privacySummarySchema,
  releasePrivacyResponseSchema,
  savePrivacyDraftSchema,
  updatePrivacyRequestSchema,
} from "./schemas"

type PersonalDataResponse = z.infer<typeof personalDataResponseSchema>
type PrivacyRequestSummary = z.infer<typeof privacySummarySchema>
type PrivacyRequestStatus = PrivacyRequestSummary["status"]
type PrivacyAdminSummary = PrivacyRequestSummary & {
  subjectName: string
  subjectEmail: string
}
type PrivacyEvent = { id: string; message: string; createdAt: string }
type PrivacyAdminDetail = {
  request: PrivacyAdminSummary
  subjectUserId: string | null
  draft: PersonalDataResponse | null
  events: Array<PrivacyEvent & { internalNote: string }>
}
type SavePrivacyDraftInput = z.infer<typeof savePrivacyDraftSchema>
type UpdatePrivacyRequestInput = z.infer<typeof updatePrivacyRequestSchema>
type ReleasePrivacyResponseInput = z.infer<typeof releasePrivacyResponseSchema>

export type {
  PersonalDataResponse,
  PrivacyAdminDetail,
  PrivacyAdminSummary,
  PrivacyEvent,
  PrivacyRequestStatus,
  PrivacyRequestSummary,
  ReleasePrivacyResponseInput,
  SavePrivacyDraftInput,
  UpdatePrivacyRequestInput,
}

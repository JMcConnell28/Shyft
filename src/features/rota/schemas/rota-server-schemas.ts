import { z } from "zod"

import { organizationSlugSchema } from "@/features/onboarding/schemas/onboarding-schemas"
import {
  isoDateSchema,
  locationSlugSchema,
  rotaPageSizeSchema,
  rotaRangeFilterSchema,
  rotaStatusFilterSchema,
} from "@/features/rota/schemas/rota-schemas"

const organizationScopedUserSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization."),
  userId: z.string().trim().min(1, "Choose a user."),
})

const normalizedRotaListSearchSchema = z.object({
  location: locationSlugSchema.optional(),
  status: rotaStatusFilterSchema,
  range: rotaRangeFilterSchema,
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  page: z.number().int().min(1),
  pageSize: rotaPageSizeSchema,
})

const getHasUnreadRotaUpdatesInputSchema = organizationScopedUserSchema

const getRotaListPageDataInputSchema = organizationScopedUserSchema.extend({
  orgSlug: organizationSlugSchema,
  search: normalizedRotaListSearchSchema,
})

const getRotaDetailPageDataInputSchema = organizationScopedUserSchema.extend({
  orgSlug: organizationSlugSchema,
  locationSlug: locationSlugSchema,
  rotaId: z.uuid(),
})

export {
  getHasUnreadRotaUpdatesInputSchema,
  getRotaDetailPageDataInputSchema,
  getRotaListPageDataInputSchema,
}

import type { RotaListSearch } from "@/features/rota/schemas/rota-schemas"

const rotaQueryKeys = {
  all: ["rota"] as const,
  listPage: (input: {
    organizationId: string
    orgSlug: string
    userId: string
    search: RotaListSearch
  }) => [...rotaQueryKeys.all, "list-page", input] as const,
  creationPreview: (input: {
    locationId: string
    weekStart: string
  }) => [...rotaQueryKeys.all, "creation-preview", input] as const,
}

export { rotaQueryKeys }

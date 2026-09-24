import { normalizeOrganizationSlug } from "@/features/onboarding/schemas/onboarding-schemas"

function getOrganizationSlugCandidate(name: string, attempt: number): string {
  const normalized = normalizeOrganizationSlug(name)
  const base =
    normalized.length >= 2
      ? normalized
      : normalized
        ? `${normalized}-workspace`
        : "workspace"
  const suffix = attempt === 0 ? "" : `-${attempt + 1}`
  return `${base.slice(0, 48 - suffix.length).replace(/-$/, "")}${suffix}`
}

export { getOrganizationSlugCandidate }

import type { OrganizationSummary } from "@/features/onboarding/types"
import { useOrganizationSwitch } from "@/features/navigation/hooks/use-organization-switch"
import { Button } from "@/components/ui/button"

function OrganizationSwitcherList({
  organizations,
  activeOrganizationId,
}: {
  organizations: Array<OrganizationSummary>
  activeOrganizationId: string | null
}) {
  const { switchingId, switchOrganization } =
    useOrganizationSwitch(organizations)

  return (
    <div className="space-y-2">
      {organizations.map((organization) => {
        const isCurrent = organization.id === activeOrganizationId
        return (
          <div
            key={organization.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {organization.name}
              </p>
              {isCurrent ? (
                <p className="text-xs text-muted-foreground">
                  Currently viewing
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={Boolean(switchingId) || isCurrent}
              onClick={() => void switchOrganization(organization.id)}
            >
              {switchingId === organization.id
                ? "Opening..."
                : isCurrent
                  ? "Current"
                  : "Open"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export { OrganizationSwitcherList }

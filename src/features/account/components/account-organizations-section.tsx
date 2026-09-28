import type { OrganizationSummary } from "@/features/onboarding/types"
import { OrganizationSwitcherList } from "@/features/navigation/components/organization-switcher-list"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function AccountOrganizationsSection({
  organizations,
  activeOrganizationId,
}: {
  organizations: Array<OrganizationSummary>
  activeOrganizationId: string | null
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>
          Choose which organization you are viewing. Switching reloads the app
          with that organization’s data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OrganizationSwitcherList
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
      </CardContent>
    </Card>
  )
}

export { AccountOrganizationsSection }

import { createFileRoute, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { LocationSetupWizard } from "@/features/onboarding/components/location-setup-wizard"
import { SetupArtworkShell } from "@/features/onboarding/components/setup-artwork-shell"
import { renameOnboardingOrganization } from "@/features/onboarding/server/rename-onboarding-organization"
import {
  getExistingOrganizationRedirect,
  getPendingOnboardingPath,
} from "@/features/onboarding/utils/viewer-route-redirects"
import { createFirstLocationAndZone } from "@/lib/onboarding"
import { roles } from "@/lib/auth/permissions"

import { loadDefaultViewer } from "@/features/navigation/load-navigation-context"

export const Route = createFileRoute("/_authed/_verified/onboarding/location")({
  beforeLoad: async ({ context }) => {
    const viewer = await loadDefaultViewer(context)

    if (viewer.onboarding?.hasLocation) {
      const redirectTarget =
        getPendingOnboardingPath(viewer) ??
        getExistingOrganizationRedirect(viewer)

      if (redirectTarget) {
        throw redirect({ href: redirectTarget })
      }
    }
    return { viewer }
  },
  head: () => ({
    meta: [
      { title: "Create Workspace | RocketRota" },
      {
        name: "description",
        content: "Create your workspace and choose how shifts handle places.",
      },
    ],
  }),
  component: CreateLocationRoute,
})

function CreateLocationRoute() {
  const { viewer } = Route.useRouteContext()
  const createFirstLocationFn = useServerFn(createFirstLocationAndZone)
  const renameOrganization = useServerFn(renameOnboardingOrganization)
  const organization = viewer.activeOrganization
  const canRenameOrganization =
    viewer.activeRole &&
    roles[viewer.activeRole].authorize({ organization: ["update"] }).success

  return (
    <SetupArtworkShell>
      <LocationSetupWizard
        key={organization?.id}
        organizationName={organization?.name ?? "Your organisation"}
        onRenameOrganization={
          organization && canRenameOrganization
            ? (name) =>
                renameOrganization({
                  data: { organizationId: organization.id, name },
                })
            : undefined
        }
        onSubmit={(input) => createFirstLocationFn({ data: input })}
      />
    </SetupArtworkShell>
  )
}

import { createFileRoute, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { LocationSetupWizard } from "@/features/onboarding/components/location-setup-wizard"
import { SetupArtworkShell } from "@/features/onboarding/components/setup-artwork-shell"
import {
  getExistingOrganizationRedirect,
  getPendingOnboardingPath,
} from "@/features/onboarding/utils/viewer-route-redirects"
import { createFirstLocationAndZone } from "@/lib/onboarding"

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

  return (
    <SetupArtworkShell>
      <LocationSetupWizard
        organizationName={
          viewer.activeOrganization?.name ?? "Your organisation"
        }
        onSubmit={(input) => createFirstLocationFn({ data: input })}
      />
    </SetupArtworkShell>
  )
}

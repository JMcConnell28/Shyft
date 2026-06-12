import {
  createFileRoute,
  getRouteApi,
  redirect,
} from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { OnboardingShell } from "@/components/app/onboarding-shell"
import { LocationSetupWizard } from "@/features/onboarding/components/location-setup-wizard"
import {
  getExistingOrganizationRedirect,
  getPendingOnboardingPath,
} from "@/features/onboarding/utils/viewer-route-redirects"
import { createFirstLocationAndZone } from "@/lib/onboarding"

const verifiedRouteApi = getRouteApi("/_authed/_verified")

export const Route = createFileRoute("/_authed/_verified/onboarding/location")({
  beforeLoad: ({ context }) => {
    const viewer = context.viewer

    if (viewer.onboarding?.hasLocation) {
      const redirectTarget =
        getPendingOnboardingPath(viewer) ?? getExistingOrganizationRedirect(viewer)

      if (redirectTarget) {
        throw redirect({ href: redirectTarget })
      }
    }
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
  const { viewer } = verifiedRouteApi.useRouteContext()
  const createFirstLocationFn = useServerFn(createFirstLocationAndZone)

  return (
    <OnboardingShell
      badge="Workspace setup"
      eyebrow={viewer.activeWorkspace?.name ?? "Step 3"}
      title="Set up where shifts happen."
      description="Choose one work pattern, name the workspace, then RocketRota will open the dashboard."
      showSignOut
    >
      <LocationSetupWizard
        onSubmit={(input) => createFirstLocationFn({ data: input })}
      />
    </OnboardingShell>
  )
}

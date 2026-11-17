"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

import { RemoveOrganizationSection } from "@/features/settings/components/remove-organization-section"
import { WorkplaceContactSection } from "@/features/settings/components/workplace-contact-section"
import { WorkplaceLocationsSection } from "@/features/settings/components/workplace-locations-section"
import { WorkplaceOverviewSection } from "@/features/settings/components/workplace-overview-section"
import { useGeneralSettingsQuery } from "@/features/settings/hooks/use-general-settings-query"
import { useUpdateGeneralSettings } from "@/features/settings/hooks/use-update-general-settings"
import { generalSettingsFeatures } from "@/features/settings/constants/general-settings-features"

function GeneralSettingsPage({
  canRemoveOrganization,
  organizationId,
  userId,
  workspaceSlug,
}: {
  canRemoveOrganization: boolean
  organizationId: string
  userId: string
  workspaceSlug: string
}) {
  const settingsQuery = useGeneralSettingsQuery({ organizationId, userId })
  const { isSaving, saveGeneralSettings } = useUpdateGeneralSettings({
    organizationId,
    userId,
  })
  const [contactEmail, setContactEmail] = React.useState("")
  const [contactPhone, setContactPhone] = React.useState("")

  React.useEffect(() => {
    if (!settingsQuery.data) return

    setContactEmail(settingsQuery.data.contactEmail)
    setContactPhone(settingsQuery.data.contactPhone)
  }, [settingsQuery.data])

  if (settingsQuery.isPending) {
    return <GeneralSettingsState message="Loading workplace settings..." />
  }

  if (settingsQuery.isError) {
    return (
      <GeneralSettingsState
        message="We could not load workplace settings right now."
        onRetry={() => void settingsQuery.refetch()}
        pending={settingsQuery.isFetching}
      />
    )
  }

  const data = settingsQuery.data
  const hasChanges =
    contactEmail !== data.contactEmail || contactPhone !== data.contactPhone

  return (
    <div className="space-y-3">
      <WorkplaceOverviewSection organizationName={data.organization.name} />
      <WorkplaceLocationsSection locations={data.locations} />
      {generalSettingsFeatures.contactDetails && (
        <WorkplaceContactSection
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          hasChanges={hasChanges}
          isSaving={isSaving}
          onContactEmailChange={setContactEmail}
          onContactPhoneChange={setContactPhone}
          onSave={() => {
            void saveGeneralSettings({ contactEmail, contactPhone })
          }}
        />
      )}
      {canRemoveOrganization && (
        <RemoveOrganizationSection
          key={organizationId}
          organizationId={organizationId}
          organizationName={data.organization.name}
          workspaceSlug={workspaceSlug}
        />
      )}
    </div>
  )
}

function GeneralSettingsState({
  message,
  onRetry,
  pending = false,
}: {
  message: string
  onRetry?: () => void
  pending?: boolean
}) {
  return (
    <section
      role={onRetry ? "alert" : "status"}
      className="rounded-xl border border-[#dce3ef] bg-white px-4 py-8 text-center text-xs font-semibold text-[#7180a2]"
    >
      {message}
      {onRetry && (
        <Button
          className={"mx-auto mt-4"}
          variant="secondary"
          disabled={pending}
          onClick={onRetry}
        >
          {pending ? "Retrying…" : "Try again"}
        </Button>
      )}
    </section>
  )
}

export { GeneralSettingsPage }

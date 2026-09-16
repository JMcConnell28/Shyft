"use client"

import * as React from "react"

import { WorkplaceContactSection } from "@/features/settings/components/workplace-contact-section"
import { WorkplaceLocationsSection } from "@/features/settings/components/workplace-locations-section"
import { WorkplaceOverviewSection } from "@/features/settings/components/workplace-overview-section"
import { useGeneralSettingsQuery } from "@/features/settings/hooks/use-general-settings-query"
import { useUpdateGeneralSettings } from "@/features/settings/hooks/use-update-general-settings"

function GeneralSettingsPage({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
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
      <GeneralSettingsState message="We could not load workplace settings right now." />
    )
  }

  const data = settingsQuery.data
  const hasChanges =
    contactEmail !== data.contactEmail || contactPhone !== data.contactPhone

  return (
    <div className="space-y-3">
      <WorkplaceOverviewSection
        organizationName={data.organization.name}
        organizationSlug={data.organization.slug}
      />
      <WorkplaceLocationsSection locations={data.locations} />
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
    </div>
  )
}

function GeneralSettingsState({ message }: { message: string }) {
  return (
    <section className="rounded-xl border border-[#dce3ef] bg-white px-4 py-8 text-center text-xs font-semibold text-[#7180a2]">
      {message}
    </section>
  )
}

export { GeneralSettingsPage }

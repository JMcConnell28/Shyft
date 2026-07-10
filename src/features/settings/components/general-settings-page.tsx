"use client"

import * as React from "react"
import { Building2Icon, Clock3Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [estimatedClosingTime, setEstimatedClosingTime] =
    React.useState("23:00")

  React.useEffect(() => {
    if (settingsQuery.data) {
      setEstimatedClosingTime(settingsQuery.data.estimatedClosingTime)
    }
  }, [settingsQuery.data])

  if (settingsQuery.isPending) {
    return <GeneralSettingsState message="Loading general settings..." />
  }

  if (settingsQuery.isError) {
    return (
      <GeneralSettingsState message="We could not load general settings right now." />
    )
  }

  const hasChanges =
    estimatedClosingTime !== settingsQuery.data.estimatedClosingTime

  return (
    <section className="rounded-xl bg-white p-4 text-[#11245a] shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div>
        <h2 className="text-lg font-extrabold tracking-[-0.035em]">
          Workspace details
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#61709a]">
          Update operating defaults for this workspace.
        </p>
      </div>

      <div className="mt-4 divide-y divide-[#edf0f6]">
        <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3 first:pt-0">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
            <Building2Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold">Workspace type</span>
            <span className="mt-0.5 block text-sm font-semibold text-[#61709a]">
              Organization
            </span>
          </span>
        </div>

        <label className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3 last:pb-0">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
            <Clock3Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold">Default close</span>
            <Input
              className="mt-1 h-9 max-w-36 rounded-lg border-[#dfe5f0] text-sm font-bold text-[#11245a]"
              type="time"
              step={900}
              value={estimatedClosingTime}
              onChange={(event) => setEstimatedClosingTime(event.target.value)}
            />
          </span>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          className="h-10 rounded-xl px-4 text-sm font-extrabold"
          disabled={!hasChanges || isSaving}
          onClick={() => {
            void saveGeneralSettings(estimatedClosingTime)
          }}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </section>
  )
}

function GeneralSettingsState({ message }: { message: string }) {
  return (
    <section className="rounded-xl bg-white p-4 text-sm font-semibold text-[#61709a] shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      {message}
    </section>
  )
}

export { GeneralSettingsPage }

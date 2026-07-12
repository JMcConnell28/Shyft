"use client"

import { Link } from "@tanstack/react-router"
import {
  InfoIcon,
  Layers3Icon,
  LayoutTemplateIcon,
  LoaderCircleIcon,
  MapPinnedIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { RotaTemplatesSettingsCard } from "@/features/settings/components/rota-templates-settings-card"
import { useRotaSettingsQuery } from "@/features/settings/hooks/use-rota-settings-query"
import { useRotaTemplateSettingsMutations } from "@/features/settings/hooks/use-rota-template-settings-mutations"
import { getErrorMessage } from "@/lib/errors"

function RotaSettingsPage({
  organizationId,
  locationId,
  userId,
  workspaceSlug,
}: {
  organizationId?: string
  locationId?: string
  userId: string
  workspaceSlug: string
}) {
  const query = useRotaSettingsQuery({ organizationId, locationId, userId })
  const mutations = useRotaTemplateSettingsMutations({
    organizationId,
    locationId,
    userId,
  })

  if (query.isPending)
    return (
      <RotaSettingsState
        icon={LoaderCircleIcon}
        message="Loading rota settings..."
      />
    )
  if (query.isError)
    return (
      <RotaSettingsState
        icon={TriangleAlertIcon}
        message={getErrorMessage(
          query.error,
          "We could not load your rota settings right now."
        )}
      />
    )
  if (query.data.locations.length === 0)
    return (
      <RotaSettingsState
        icon={MapPinnedIcon}
        message="Add a location first, then you can manage its rota setup here."
      />
    )

  const zoneCount = query.data.locations.reduce(
    (total, location) => total + location.zones.length,
    0
  )
  const isBusy =
    mutations.renameMutation.isPending || mutations.deleteMutation.isPending

  return (
    <div className="space-y-4 text-[#11245a]">
      <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
        <h2 className="text-lg font-extrabold tracking-[-0.035em]">General</h2>
        <div className="mt-4 divide-y divide-[#edf0f6]">
          <OverviewRow
            icon={MapPinnedIcon}
            label="Locations covered"
            value={`${query.data.locations.length} locations`}
          />
          <OverviewRow
            icon={Layers3Icon}
            label="Rota zones"
            value={`${zoneCount} zones`}
            link={{ workspaceSlug }}
          />
          <OverviewRow
            icon={LayoutTemplateIcon}
            label="Saved templates"
            value={`${query.data.templates.length} templates`}
          />
        </div>
      </section>

      <RotaTemplatesSettingsCard
        pending={isBusy}
        templates={query.data.templates}
        showLocationName={query.data.locations.length > 1}
        onRename={(templateId, name) =>
          mutations.renameMutation.mutateAsync({ templateId, name })
        }
        onDelete={(templateId) =>
          mutations.deleteMutation.mutateAsync(templateId)
        }
      />

      <p className="flex items-start gap-2 rounded-xl border border-[#cddcff] bg-[#f5f8ff] px-4 py-3 text-sm font-semibold text-[#33477d]">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-[#0069ff]" />
        These settings apply to rota planning for the selected workspace.
      </p>
    </div>
  )
}

function OverviewRow({
  icon: Icon,
  label,
  link,
  value,
}: {
  icon: typeof Layers3Icon
  label: string
  link?: { workspaceSlug: string }
  value: string
}) {
  const content = (
    <>
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm">{label}</strong>
        <span className="mt-0.5 block text-xs font-medium text-[#61709a]">
          {value}
        </span>
      </span>
      {link ? (
        <span className="text-xs font-semibold text-[#0968f5]">Manage</span>
      ) : null}
    </>
  )
  return link ? (
    <Link
      to="/w/$workspaceSlug/settings/rota/zones"
      params={{ workspaceSlug: link.workspaceSlug }}
      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
    >
      {content}
    </Link>
  ) : (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      {content}
    </div>
  )
}

function RotaSettingsState({
  icon: Icon,
  message,
}: {
  icon: typeof LoaderCircleIcon
  message: string
}) {
  return (
    <section className="flex min-h-40 flex-col items-center justify-center rounded-xl bg-white p-6 text-center text-sm font-semibold text-[#61709a] ring-1 ring-[#e7eaf2]">
      <Icon className="mb-3 size-5 text-[#0069ff]" />
      {message}
    </section>
  )
}

export { RotaSettingsPage }

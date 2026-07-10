"use client"

import { LayoutTemplateIcon } from "lucide-react"

import type { RotaSettingsTemplate } from "@/features/settings/types"
import { DeleteRotaTemplateDialog } from "@/features/settings/components/delete-rota-template-dialog"
import { RenameRotaTemplateDialog } from "@/features/settings/components/rota-template-dialog"

function RotaTemplatesSettingsCard({
  pending,
  templates,
  showLocationName,
  onRename,
  onDelete,
}: {
  pending: boolean
  templates: Array<RotaSettingsTemplate>
  showLocationName: boolean
  onRename: (templateId: string, name: string) => Promise<void>
  onDelete: (templateId: string) => Promise<void>
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div>
        <h2 className="text-lg font-extrabold tracking-[-0.035em] text-[#11245a]">
          Templates
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#61709a]">
          Rename or remove saved shift patterns from the rota builder.
        </p>
      </div>

      {templates.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-[#dfe5f0] bg-[#f8faff] px-4 py-6 text-center text-sm font-semibold text-[#61709a]">
          No templates yet. Save one from the rota toolbar first.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-[#edf0f6]">
          {templates.map((template) => (
            <TemplateRow
              key={template.id}
              pending={pending}
              showLocationName={showLocationName}
              template={template}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function TemplateRow({
  pending,
  showLocationName,
  template,
  onRename,
  onDelete,
}: {
  pending: boolean
  showLocationName: boolean
  template: RotaSettingsTemplate
  onRename: (templateId: string, name: string) => Promise<void>
  onDelete: (templateId: string) => Promise<void>
}) {
  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:items-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
        <LayoutTemplateIcon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-extrabold text-[#11245a]">
            {template.name}
          </p>
          <span className="rounded-lg bg-[#f2f5fb] px-2 py-1 text-[11px] font-extrabold text-[#405078]">
            {template.shiftCount} shift{template.shiftCount === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-[#61709a]">
          {showLocationName ? template.locationName : "Location template"}
        </p>
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1">
        <RenameRotaTemplateDialog
          defaultName={template.name}
          pending={pending}
          onSubmit={async ({ name }) => {
            await onRename(template.id, name)
          }}
        />
        <DeleteRotaTemplateDialog
          templateName={template.name}
          pending={pending}
          onConfirm={async () => {
            await onDelete(template.id)
          }}
        />
      </div>
    </div>
  )
}

export { RotaTemplatesSettingsCard }

"use client"

import type { RotaSettingsTemplate } from "@/features/settings/types"
import { DeleteRotaTemplateDialog } from "@/features/settings/components/delete-rota-template-dialog"
import { RenameRotaTemplateDialog } from "@/features/settings/components/rota-template-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

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
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm">Templates</CardTitle>
        <p className="text-xs text-muted-foreground">
          Rename or remove saved shift patterns. Template shifts are managed
          from the rota toolbar.
        </p>
      </CardHeader>

      <CardContent className="divide-y divide-border/70 py-0!">
        {templates.length === 0 ? (
          <Empty className="border border-dashed border-border/70 bg-muted/10 py-6">
            <EmptyHeader>
              <EmptyTitle>No templates yet</EmptyTitle>
              <EmptyDescription>
                Save a rota as a template from the rota toolbar first.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          templates.map((template) => (
            <TemplateRow
              key={template.id}
              pending={pending}
              showLocationName={showLocationName}
              template={template}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        )}
      </CardContent>
    </Card>
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
    <div className="flex min-h-16 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {template.name}
          </p>
          <Badge variant="outline">
            {template.shiftCount} shift{template.shiftCount === 1 ? "" : "s"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {showLocationName ? template.locationName : "Location template"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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

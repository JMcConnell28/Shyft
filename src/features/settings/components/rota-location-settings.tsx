"use client"

import type {
  RotaSettingsLocation,
  RotaSettingsTemplate,
} from "@/features/settings/types"
import type { useRotaSettingsMutations } from "@/features/settings/hooks/use-rota-settings-mutations"
import type { useRotaTemplateSettingsMutations } from "@/features/settings/hooks/use-rota-template-settings-mutations"
import { RotaDefaultsSettingsSection } from "@/features/settings/components/rota-defaults-settings-section"
import { RotaEditingSettingsSection } from "@/features/settings/components/rota-editing-settings-section"
import { RotaPublishingSettingsSection } from "@/features/settings/components/rota-publishing-settings-section"
import { RotaShiftRulesSettingsSection } from "@/features/settings/components/rota-shift-rules-settings-section"
import { RotaTemplateCopyingSettingsSection } from "@/features/settings/components/rota-template-copying-settings-section"
import { RotaTemplatesSettingsCard } from "@/features/settings/components/rota-templates-settings-card"
import { useRotaLocationSettings } from "@/features/settings/hooks/use-rota-location-settings"

type RotaSettingsMutations = ReturnType<typeof useRotaSettingsMutations>
type TemplateMutations = ReturnType<typeof useRotaTemplateSettingsMutations>

function RotaLocationSettings({
  location,
  rotaMutations,
  templateMutations,
  templates,
}: {
  location: RotaSettingsLocation
  rotaMutations: RotaSettingsMutations
  templateMutations: TemplateMutations
  templates: Array<RotaSettingsTemplate>
}) {
  const { isSaving, update, values } = useRotaLocationSettings(
    location,
    rotaMutations
  )
  const isManagingTemplates =
    templateMutations.renameMutation.isPending ||
    templateMutations.deleteMutation.isPending

  return (
    <div className="animate-in space-y-2.5 duration-300 fade-in slide-in-from-bottom-1 motion-reduce:animate-none sm:space-y-3">
      <div className="flex h-4 items-center justify-end text-[10px] font-semibold text-[#7180a2]">
        {isSaving ? (
          <span className="text-[#1769ff]">Saving changes...</span>
        ) : (
          <span>Changes save automatically</span>
        )}
      </div>
      <RotaDefaultsSettingsSection
        onUpdate={update}
        values={values}
        zones={location.zones}
      />
      <RotaEditingSettingsSection onUpdate={update} values={values} />
      <RotaShiftRulesSettingsSection />
      <RotaTemplateCopyingSettingsSection
        onUpdate={update}
        templateCount={templates.length}
        values={values}
      />
      <RotaPublishingSettingsSection onUpdate={update} values={values} />
      <RotaTemplatesSettingsCard
        pending={isManagingTemplates}
        showLocationName={false}
        templates={templates}
        onDelete={(templateId) =>
          templateMutations.deleteMutation.mutateAsync(templateId)
        }
        onRename={(templateId, name) =>
          templateMutations.renameMutation.mutateAsync({ templateId, name })
        }
      />
    </div>
  )
}

export { RotaLocationSettings }

import { ContactRoundIcon, MailIcon, PhoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkplaceSettingRow } from "@/features/settings/components/workplace-setting-row"
import { WorkplaceSettingsSection } from "@/features/settings/components/workplace-settings-section"

function WorkplaceContactSection({
  contactEmail,
  contactPhone,
  hasChanges,
  isSaving,
  onContactEmailChange,
  onContactPhoneChange,
  onSave,
}: {
  contactEmail: string
  contactPhone: string
  hasChanges: boolean
  isSaving: boolean
  onContactEmailChange: (value: string) => void
  onContactPhoneChange: (value: string) => void
  onSave: () => void
}) {
  return (
    <WorkplaceSettingsSection
      description="How RocketRota can contact your workplace."
      icon={ContactRoundIcon}
      title="Contact details"
    >
      <WorkplaceSettingRow
        description="Used for important workplace and account messages."
        title="Contact email"
      >
        <div className="relative w-40 sm:w-60">
          <MailIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#8b98b5]" />
          <Input
            aria-label="Contact email"
            className="h-8 rounded-lg border-[#dce3ef] bg-white pr-2.5 pl-8 text-[11px] font-semibold text-[#14214a] shadow-none"
            onChange={(event) => onContactEmailChange(event.target.value)}
            placeholder="hello@workplace.com"
            type="email"
            value={contactEmail}
          />
        </div>
      </WorkplaceSettingRow>
      <WorkplaceSettingRow
        description="The main phone number for workplace enquiries."
        title="Contact phone"
      >
        <div className="relative w-40 sm:w-60">
          <PhoneIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#8b98b5]" />
          <Input
            aria-label="Contact phone"
            className="h-8 rounded-lg border-[#dce3ef] bg-white pr-2.5 pl-8 text-[11px] font-semibold text-[#14214a] shadow-none"
            onChange={(event) => onContactPhoneChange(event.target.value)}
            placeholder="+44 20 1234 5678"
            type="tel"
            value={contactPhone}
          />
        </div>
      </WorkplaceSettingRow>
      <div className="flex min-h-14 items-center justify-end py-2">
        <Button
          className="h-8 rounded-lg px-3 text-[11px] font-bold"
          disabled={!hasChanges || isSaving}
          onClick={onSave}
        >
          {isSaving ? "Saving..." : "Save contact details"}
        </Button>
      </div>
    </WorkplaceSettingsSection>
  )
}

export { WorkplaceContactSection }

import { LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  businessTypeOptions,
  getDefaultZoneNames,
} from "@/features/onboarding/constants/location-setup-options"
import {
  type OnboardingBusinessType,
  type OnboardingPlanningMode,
} from "@/features/onboarding/schemas/onboarding-schemas"
import {
  ChoiceButton,
  SummaryRow,
  WizardQuestion,
} from "@/features/onboarding/components/location-setup-wizard-ui"

type WorksiteChoice = "skip" | "add"

function BusinessTypeStep({
  businessType,
  onChange,
}: {
  businessType: OnboardingBusinessType
  onChange: (value: OnboardingBusinessType) => void
}) {
  return (
    <WizardQuestion
      title="How should RocketRota handle locations?"
      description="Pick the pattern that matches how your rotas are planned."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {businessTypeOptions.map((option) => (
          <ChoiceButton
            key={option.value}
            checked={businessType === option.value}
            onClick={() => onChange(option.value)}
            icon={<option.icon className="size-4" />}
            title={option.label}
            description={option.description}
          />
        ))}
      </div>
    </WizardQuestion>
  )
}

function NameStep({
  planningMode,
  workspaceName,
  onChange,
}: {
  planningMode: OnboardingPlanningMode
  workspaceName: string
  onChange: (value: string) => void
}) {
  const placeholder =
    planningMode === "fixed_location" ? "The Crown" : "City Security Team"

  return (
    <WizardQuestion
      title="What should we call this workspace?"
      description="This is the name managers and team members will see."
    >
      <Input
        autoFocus
        value={workspaceName}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 px-3 text-base md:text-sm"
      />
    </WizardQuestion>
  )
}

function AreasStep({
  businessType,
  selectedZoneNames,
  customAreaName,
  onCustomAreaNameChange,
  onAddCustomArea,
  onToggleZoneName,
}: {
  businessType: OnboardingBusinessType
  selectedZoneNames: string[]
  customAreaName: string
  onCustomAreaNameChange: (value: string) => void
  onAddCustomArea: () => void
  onToggleZoneName: (value: string) => void
}) {
  const presets = getDefaultZoneNames(businessType)

  return (
    <WizardQuestion
      title="What areas do you want on your first rota?"
      description="Pick one or more permanent areas. You can add more later."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {presets.map((preset) => (
          <ChoiceButton
            key={preset}
            checked={selectedZoneNames.includes(preset)}
            onClick={() => onToggleZoneName(preset)}
            title={preset}
            description="Permanent rota area"
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={customAreaName}
          onChange={(event) => onCustomAreaNameChange(event.target.value)}
          placeholder="Add custom area"
          className="h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onAddCustomArea}
        >
          Add
        </Button>
      </div>
    </WizardQuestion>
  )
}

function WorksiteStep({
  choice,
  worksiteName,
  onChoiceChange,
  onWorksiteNameChange,
}: {
  choice: WorksiteChoice
  worksiteName: string
  onChoiceChange: (value: WorksiteChoice) => void
  onWorksiteNameChange: (value: string) => void
}) {
  return (
    <WizardQuestion
      title="Do you want to add a usual worksite now?"
      description="Skip this if sites change often. You can add worksites while planning rotas."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <ChoiceButton
          checked={choice === "skip"}
          onClick={() => onChoiceChange("skip")}
          title="Skip for now"
          description="Create worksites later on the rota."
        />
        <ChoiceButton
          checked={choice === "add"}
          onClick={() => onChoiceChange("add")}
          title="Add a usual worksite"
          description="Save one client or site to start."
        />
      </div>
      {choice === "add" ? (
        <Input
          autoFocus
          value={worksiteName}
          onChange={(event) => onWorksiteNameChange(event.target.value)}
          placeholder="Office Block A"
          className="h-11 px-3 text-base md:text-sm"
        />
      ) : null}
    </WizardQuestion>
  )
}

function SummaryStep({
  businessLabel,
  planningMode,
  workspaceName,
  zoneNames,
  worksiteName,
}: {
  businessLabel: string
  planningMode: OnboardingPlanningMode
  workspaceName: string
  zoneNames: string[]
  worksiteName: string
}) {
  const isFixed = planningMode === "fixed_location"

  return (
    <WizardQuestion
      title="Ready to create your workspace?"
      description={
        isFixed
          ? "This workspace will use zones for permanent work areas."
          : "This workspace will use worksites for changing client or job locations."
      }
    >
      <div className="divide-y divide-border rounded-lg border border-border/70">
        <SummaryRow label="Workspace" value={workspaceName.trim()} />
        <SummaryRow label="Work pattern" value={businessLabel} />
        <SummaryRow
          label={isFixed ? "Areas" : "Worksite"}
          value={
            isFixed
              ? zoneNames.join(", ")
              : worksiteName.trim() || "No usual worksite yet"
          }
        />
      </div>
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
        <LockIcon className="mt-0.5 size-4 shrink-0" />
        <p className="text-xs leading-5">
          This choice cannot be changed for this workspace later.
        </p>
      </div>
    </WizardQuestion>
  )
}

export { AreasStep, BusinessTypeStep, NameStep, SummaryStep, WorksiteStep }
export type { WorksiteChoice }

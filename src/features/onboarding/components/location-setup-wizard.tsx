import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { FormErrorMessage } from "@/components/forms/form-error-message"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  fixedProgress,
  getBusinessTypeOption,
  getDefaultZoneNames,
  getPlanningModeForBusinessType,
  variableProgress,
} from "@/features/onboarding/constants/location-setup-options"
import {
  AreasStep,
  BusinessTypeStep,
  NameStep,
  SummaryStep,
  WorksiteStep,
  type WorksiteChoice,
} from "@/features/onboarding/components/location-setup-wizard-steps"
import {
  locationSetupSchema,
  type LocationSetupInput,
  type OnboardingBusinessType,
  type OnboardingPlanningMode,
} from "@/features/onboarding/schemas/onboarding-schemas"
import { getErrorMessage } from "@/lib/errors"

type WizardStep = "business" | "name" | "places" | "summary"

type LocationSetupWizardProps = {
  onSubmit: (input: LocationSetupInput) => Promise<{ redirectTo: string }>
}

const stepOrder: readonly WizardStep[] = [
  "business",
  "name",
  "places",
  "summary",
]

function LocationSetupWizard({ onSubmit }: LocationSetupWizardProps) {
  const [step, setStep] = React.useState<WizardStep>("business")
  const [businessType, setBusinessType] =
    React.useState<OnboardingBusinessType>("hospitality")
  const [workspaceName, setWorkspaceName] = React.useState("")
  const [selectedZoneNames, setSelectedZoneNames] = React.useState<string[]>([
    "Main area",
  ])
  const [customAreaName, setCustomAreaName] = React.useState("")
  const [worksiteChoice, setWorksiteChoice] =
    React.useState<WorksiteChoice>("skip")
  const [worksiteName, setWorksiteName] = React.useState("")
  const [includeOwnerAsEmployee, setIncludeOwnerAsEmployee] =
    React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const planningMode = getPlanningModeForBusinessType(businessType)
  const businessOption = getBusinessTypeOption(businessType)
  const currentProgress = getProgress(step, planningMode)
  const isFixed = planningMode === "fixed_location"
  const canContinue = getCanContinue({
    step,
    workspaceName,
    selectedZoneNames,
    planningMode,
    worksiteChoice,
    worksiteName,
  })

  function handleBusinessTypeChange(nextBusinessType: OnboardingBusinessType) {
    setBusinessType(nextBusinessType)
    setError(null)

    if (getPlanningModeForBusinessType(nextBusinessType) === "fixed_location") {
      setSelectedZoneNames([
        getDefaultZoneNames(nextBusinessType)[0] ?? "Zone 1",
      ])
    } else {
      setSelectedZoneNames([])
    }
  }

  function handleNext() {
    if (!canContinue) {
      setError(getStepError(step, planningMode))
      return
    }

    setError(null)
    setStep((current) => stepOrder[stepOrder.indexOf(current) + 1] ?? current)
  }

  function handleBack() {
    setError(null)
    setStep((current) => stepOrder[stepOrder.indexOf(current) - 1] ?? current)
  }

  function toggleZoneName(zoneName: string) {
    setError(null)
    setSelectedZoneNames((current) =>
      current.includes(zoneName)
        ? current.filter((name) => name !== zoneName)
        : [...current, zoneName]
    )
  }

  function addCustomArea() {
    const name = customAreaName.trim()

    if (!name) {
      return
    }

    setSelectedZoneNames((current) => {
      if (current.some((entry) => entry.toLowerCase() === name.toLowerCase())) {
        return current
      }

      return [...current, name]
    })
    setCustomAreaName("")
    setError(null)
  }

  async function handleSubmit() {
    const payload = {
      businessType,
      planningMode,
      locationName: workspaceName,
      zoneNames: isFixed ? selectedZoneNames : [],
      worksiteName:
        planningMode === "variable_location" && worksiteChoice === "add"
          ? worksiteName
          : "",
      includeOwnerAsEmployee,
    } satisfies LocationSetupInput

    const parsed = locationSetupSchema.safeParse(payload)

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your setup details.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await onSubmit(parsed.data)
      window.location.href = result.redirectTo
    } catch (submissionError) {
      setIsSubmitting(false)
      setError(
        getErrorMessage(submissionError, "We could not create your workspace.")
      )
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background p-3 shadow-sm sm:p-4">
      <WizardProgress progress={currentProgress} step={step} />
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()

          if (step === "summary") {
            void handleSubmit()
            return
          }

          handleNext()
        }}
      >
        <div
          key={step}
          className="min-h-[16rem] animate-in space-y-3 duration-200 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none"
        >
          {step === "business" ? (
            <BusinessTypeStep
              businessType={businessType}
              onChange={handleBusinessTypeChange}
            />
          ) : null}
          {step === "name" ? (
            <NameStep
              planningMode={planningMode}
              workspaceName={workspaceName}
              onChange={setWorkspaceName}
            />
          ) : null}
          {step === "places" && isFixed ? (
            <AreasStep
              businessType={businessType}
              selectedZoneNames={selectedZoneNames}
              customAreaName={customAreaName}
              onCustomAreaNameChange={setCustomAreaName}
              onAddCustomArea={addCustomArea}
              onToggleZoneName={toggleZoneName}
            />
          ) : null}
          {step === "places" && !isFixed ? (
            <WorksiteStep
              choice={worksiteChoice}
              worksiteName={worksiteName}
              onChoiceChange={setWorksiteChoice}
              onWorksiteNameChange={setWorksiteName}
            />
          ) : null}
          {step === "summary" ? (
            <>
              <SummaryStep
                businessLabel={businessOption?.label ?? "Team"}
                planningMode={planningMode}
                workspaceName={workspaceName}
                zoneNames={selectedZoneNames}
                worksiteName={worksiteChoice === "add" ? worksiteName : ""}
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 p-3">
                <Checkbox
                  className="mt-0.5"
                  checked={includeOwnerAsEmployee}
                  onCheckedChange={(checked) =>
                    setIncludeOwnerAsEmployee(checked === true)
                  }
                />
                <span className="text-xs leading-5 text-muted-foreground">
                  Add me as a schedulable employee so I can appear on rotas and
                  clock in. Leave this off if you only manage the team.
                </span>
              </label>
            </>
          ) : null}
        </div>

        <FormErrorMessage message={error} />
        <WizardControls
          canContinue={canContinue}
          isSubmitting={isSubmitting}
          step={step}
          onBack={handleBack}
        />
      </form>
    </div>
  )
}

function WizardProgress({
  progress,
  step,
}: {
  progress: number
  step: WizardStep
}) {
  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
        <span>
          Step {stepOrder.indexOf(step) + 1} of {stepOrder.length}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function WizardControls({
  canContinue,
  isSubmitting,
  step,
  onBack,
}: {
  canContinue: boolean
  isSubmitting: boolean
  step: WizardStep
  onBack: () => void
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onBack}
        disabled={step === "business" || isSubmitting}
        className="sm:w-auto"
      >
        <ArrowLeftIcon />
        Back
      </Button>
      <Button
        type="submit"
        size="lg"
        disabled={!canContinue || isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting
          ? "Creating..."
          : step === "summary"
            ? "Create workspace"
            : "Continue"}
        {!isSubmitting ? <ArrowRightIcon /> : null}
      </Button>
    </div>
  )
}

function getCanContinue({
  step,
  workspaceName,
  selectedZoneNames,
  planningMode,
  worksiteChoice,
  worksiteName,
}: {
  step: WizardStep
  workspaceName: string
  selectedZoneNames: string[]
  planningMode: OnboardingPlanningMode
  worksiteChoice: WorksiteChoice
  worksiteName: string
}) {
  if (step === "name") {
    return workspaceName.trim().length >= 2
  }

  if (step === "places" && planningMode === "fixed_location") {
    return selectedZoneNames.length > 0
  }

  if (
    step === "places" &&
    planningMode === "variable_location" &&
    worksiteChoice === "add"
  ) {
    return worksiteName.trim().length >= 2
  }

  return true
}

function getStepError(step: WizardStep, planningMode: OnboardingPlanningMode) {
  if (step === "name") {
    return "Enter a workspace name."
  }

  if (step === "places" && planningMode === "fixed_location") {
    return "Choose at least one area."
  }

  if (step === "places") {
    return "Enter a worksite name or skip this step."
  }

  return "Check this step before continuing."
}

function getProgress(step: WizardStep, planningMode: OnboardingPlanningMode) {
  const progress =
    planningMode === "fixed_location" ? fixedProgress : variableProgress

  if (step === "summary") {
    return 100
  }

  return progress[stepOrder.indexOf(step)] ?? 100
}

export { LocationSetupWizard }

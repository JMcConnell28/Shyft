import * as React from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Clock3Icon,
  MapPinnedIcon,
  PencilLineIcon,
  ShapesIcon,
} from "lucide-react"

import { FormErrorMessage } from "@/components/forms/form-error-message"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  emptyTimeAttendanceAddress,
  toTimeAttendanceDeliveryAddress,
} from "@/features/billing/components/time-attendance-address-fields"
import { timeAttendanceDeliveryAddressSchema } from "@/features/billing/schemas/time-attendance-addon-schemas"
import {
  getBusinessTypeOption,
  getDefaultZoneNames,
  getPlanningModeForBusinessType,
} from "@/features/onboarding/constants/location-setup-options"
import {
  AreasStep,
  BusinessTypeStep,
  NameStep,
  SummaryStep,
  TimeAttendanceStep,
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
import { cn } from "@/lib/utils"

type WizardStep = "business" | "name" | "places" | "attendance" | "summary"

type LocationSetupWizardProps = {
  onSubmit: (input: LocationSetupInput) => Promise<{ redirectTo: string }>
}

const stepOrder: readonly WizardStep[] = [
  "business",
  "name",
  "places",
  "attendance",
  "summary",
]

const stepMeta: Record<
  WizardStep,
  {
    icon: typeof MapPinnedIcon
    label: string
  }
> = {
  attendance: { icon: Clock3Icon, label: "Add-on" },
  business: { icon: MapPinnedIcon, label: "Pattern" },
  name: { icon: PencilLineIcon, label: "Name" },
  places: { icon: ShapesIcon, label: "Places" },
  summary: { icon: CheckIcon, label: "Review" },
}

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
  const [timeAttendanceEnabled, setTimeAttendanceEnabled] =
    React.useState(false)
  const [timeAttendanceAddress, setTimeAttendanceAddress] = React.useState(
    emptyTimeAttendanceAddress
  )
  const [postcodeMessage, setPostcodeMessage] = React.useState("")
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
    const stepError = getStepError({
      planningMode,
      step,
      timeAttendanceAddress,
      timeAttendanceEnabled,
    })
    const timeAttendanceResult =
      step === "attendance" && timeAttendanceEnabled
        ? timeAttendanceDeliveryAddressSchema.safeParse(
            toTimeAttendanceDeliveryAddress(timeAttendanceAddress)
          )
        : null

    if (!canContinue) {
      setError(stepError)
      return
    }

    if (timeAttendanceResult && !timeAttendanceResult.success) {
      const postcodeIssue = timeAttendanceResult.error.issues.find(
        (issue) => issue.path[0] === "postcode"
      )

      setPostcodeMessage(postcodeIssue?.message ?? "")
      setError(stepError)
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

  function handleTimeAttendanceEnabledChange(enabled: boolean) {
    setTimeAttendanceEnabled(enabled)
    setError(null)
    setPostcodeMessage("")
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
    const deliveryAddress = timeAttendanceEnabled
      ? toTimeAttendanceDeliveryAddress(timeAttendanceAddress)
      : undefined
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
      timeAttendanceDeliveryAddress: deliveryAddress,
      timeAttendanceEnabled,
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
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm lg:grid lg:min-h-[34rem] lg:grid-cols-[15rem_1fr]">
      <WizardSidebar progress={currentProgress} step={step} />
      <form
        className="flex min-h-[31rem] flex-col gap-4 p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault()

          if (step === "summary") {
            void handleSubmit()
            return
          }

          handleNext()
        }}
      >
        <WizardProgress progress={currentProgress} step={step} />
        <div
          key={step}
          className="min-h-[18rem] flex-1 animate-in space-y-3 duration-200 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none"
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
          {step === "attendance" ? (
            <TimeAttendanceStep
              address={timeAttendanceAddress}
              enabled={timeAttendanceEnabled}
              postcodeMessage={postcodeMessage}
              onAddressChange={setTimeAttendanceAddress}
              onEnabledChange={handleTimeAttendanceEnabledChange}
              onPostcodeChange={() => {
                setPostcodeMessage("")
                setError(null)
              }}
            />
          ) : null}
          {step === "summary" ? (
            <>
              <SummaryStep
                businessLabel={businessOption?.label ?? "Team"}
                planningMode={planningMode}
                timeAttendanceEnabled={timeAttendanceEnabled}
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
    <div className="space-y-2 lg:hidden">
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

function WizardSidebar({
  progress,
  step,
}: {
  progress: number
  step: WizardStep
}) {
  const activeIndex = stepOrder.indexOf(step)

  return (
    <aside className="hidden border-r border-border/70 bg-muted/20 p-4 lg:block">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Setup progress
            </p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {progress}%
            </p>
          </div>
          <ol className="space-y-2">
            {stepOrder.map((item, index) => {
              const meta = stepMeta[item]
              const Icon = meta.icon
              const isActive = item === step
              const isComplete = index < activeIndex

              return (
                <li key={item}>
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground",
                      isComplete ? "text-primary" : null
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md border border-border/70 bg-background",
                        isActive || isComplete
                          ? "border-primary/30 text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {isComplete ? (
                        <CheckIcon className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    {meta.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Keep this light. You can adjust team details, billing and clock-in
          settings after setup.
        </p>
      </div>
    </aside>
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

function getStepError({
  planningMode,
  step,
  timeAttendanceAddress,
  timeAttendanceEnabled,
}: {
  planningMode: OnboardingPlanningMode
  step: WizardStep
  timeAttendanceAddress: typeof emptyTimeAttendanceAddress
  timeAttendanceEnabled: boolean
}) {
  if (step === "name") {
    return "Enter a workspace name."
  }

  if (step === "places" && planningMode === "fixed_location") {
    return "Choose at least one area."
  }

  if (step === "places") {
    return "Enter a worksite name or skip this step."
  }

  if (step === "attendance" && timeAttendanceEnabled) {
    const parsed = timeAttendanceDeliveryAddressSchema.safeParse(
      toTimeAttendanceDeliveryAddress(timeAttendanceAddress)
    )

    return (
      parsed.error?.issues[0]?.message ??
      "Enter a delivery address for the clock-in station."
    )
  }

  return "Check this step before continuing."
}

function getProgress(step: WizardStep, _planningMode: OnboardingPlanningMode) {
  return Math.round(((stepOrder.indexOf(step) + 1) / stepOrder.length) * 100)
}

export { LocationSetupWizard }

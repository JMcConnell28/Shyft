"use client"

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import type { LocationSetupInput } from "@/features/onboarding/types"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { Button } from "@/components/ui/button"
import {
  emptyTimeAttendanceAddress,
  toTimeAttendanceDeliveryAddress,
} from "@/features/billing/components/time-attendance-address-fields"
import {
  LocationStep,
  ZonesStep,
} from "@/features/onboarding/components/location-setup-wizard-steps"
import { AddonStep } from "@/features/onboarding/components/location-setup-addon-step"
import { ReviewStep } from "@/features/onboarding/components/location-setup-review-step"
import { SetupStepper } from "@/features/onboarding/components/setup-stepper"
import { locationSetupSchema } from "@/features/onboarding/schemas/onboarding-schemas"
import { getErrorMessage } from "@/lib/errors"

type LocationSetupWizardProps = {
  organizationName: string
  onSubmit: (input: LocationSetupInput) => Promise<{ redirectTo: string }>
}

const stepLabels = ["Location", "Zones", "Add-on", "Review"] as const

function LocationSetupWizard({
  organizationName,
  onSubmit,
}: LocationSetupWizardProps) {
  const [step, setStep] = React.useState(0)
  const [locationName, setLocationName] = React.useState("")
  const [zoneNames, setZoneNames] = React.useState<Array<string>>(["Main area"])
  const [addonEnabled, setAddonEnabled] = React.useState(false)
  const [address, setAddress] = React.useState(emptyTimeAttendanceAddress)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  function buildPayload(): LocationSetupInput {
    const deliveryAddress = addonEnabled
      ? toTimeAttendanceDeliveryAddress(address)
      : undefined

    return {
      businessType: "hospitality",
      planningMode: "fixed_location",
      locationName,
      zoneNames,
      worksiteName: "",
      timeAttendanceEnabled: addonEnabled,
      locationAddress: deliveryAddress
        ? {
            line1: deliveryAddress.line1,
            line2: deliveryAddress.line2,
            city: deliveryAddress.city,
            county: deliveryAddress.county,
            postcode: deliveryAddress.postcode,
            country: deliveryAddress.country,
          }
        : undefined,
      timeAttendanceDeliveryAddress: deliveryAddress,
    }
  }

  async function advance() {
    if (step === 0 && locationName.trim().length < 2) {
      setError("Enter a location name.")
      return
    }
    if (step === 1 && zoneNames.length === 0) {
      setError("Add at least one zone.")
      return
    }

    const parsed = locationSetupSchema.safeParse(buildPayload())
    if (step >= 2 && !parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your setup details.")
      return
    }
    setError(null)

    if (step < 3) {
      setStep(step + 1)
      return
    }

    if (!parsed.success) return
    setIsSubmitting(true)
    try {
      const result = await onSubmit(parsed.data)
      window.location.assign(result.redirectTo)
    } catch (submissionError) {
      setIsSubmitting(false)
      setError(
        getErrorMessage(submissionError, "We could not create your workspace.")
      )
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void advance()
      }}
    >
      <SetupStepper activeIndex={step} labels={stepLabels} />
      <div
        key={step}
        className="animate-in duration-300 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none"
      >
        {step === 0 ? (
          <LocationStep
            locationName={locationName}
            onLocationNameChange={setLocationName}
          />
        ) : null}
        {step === 1 ? (
          <ZonesStep zoneNames={zoneNames} onZoneNamesChange={setZoneNames} />
        ) : null}
        {step === 2 ? (
          <AddonStep
            address={address}
            enabled={addonEnabled}
            onAddressChange={setAddress}
            onEnabledChange={setAddonEnabled}
          />
        ) : null}
        {step === 3 ? (
          <ReviewStep
            organizationName={organizationName}
            locationName={locationName}
            zoneNames={zoneNames}
            addonEnabled={addonEnabled}
            address={address}
            onEdit={setStep}
          />
        ) : null}
      </div>
      <div className="mx-auto mt-3 max-w-[540px]">
        <FormErrorMessage message={error} />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-11 w-full rounded-xl bg-[#1264e9] text-sm font-semibold shadow-[0_10px_24px_rgba(18,100,233,0.16)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#0757d7] hover:shadow-[0_14px_28px_rgba(18,100,233,0.2)] motion-reduce:transform-none"
        >
          {isSubmitting
            ? "Creating..."
            : step === 3
              ? "Create workspace"
              : "Continue"}
          {!isSubmitting ? <ArrowRightIcon className="ml-2 size-4" /> : null}
        </Button>
        <div className="mt-1 text-center">
          {step > 0 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setError(null)
                setStep(step - 1)
              }}
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#075fe6] underline underline-offset-4"
            >
              <ArrowLeftIcon className="size-4" /> Back
            </button>
          ) : (
            <p className="text-xs text-[#687b9b]">
              You can add more locations in settings later.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

export { LocationSetupWizard }

"use client"

import * as React from "react"
import { MapPinPlusIcon, PlusIcon, XIcon } from "lucide-react"

import type {
  OnboardingBusinessType,
  OnboardingPlanningMode,
} from "@/features/onboarding/schemas/onboarding-schemas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/errors"
import { createLocationDetailsSchema } from "@/features/settings/schemas/location-settings-schemas"

type CreateLocationValues = {
  name: string
  businessType: OnboardingBusinessType
  planningMode: OnboardingPlanningMode
  zoneNames: Array<string>
  worksiteName: string
}

function CreateLocationDialog({
  pending,
  onSubmit,
}: {
  pending: boolean
  onSubmit: (values: CreateLocationValues) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [zones, setZones] = React.useState(["Main area"])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName("")
      setZones(["Main area"])
      setError(null)
    }
  }, [open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const locationName = name.trim()
    const zoneNames = zones.map((zone) => zone.trim())
    const parsed = createLocationDetailsSchema.safeParse({
      name: locationName,
      businessType: "hospitality",
      planningMode: "fixed_location",
      zoneNames,
      worksiteName: "",
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the location details.")
      return
    }
    try {
      await onSubmit({
        name: locationName,
        businessType: "hospitality",
        planningMode: "fixed_location",
        zoneNames,
        worksiteName: "",
      })
      setOpen(false)
    } catch (submissionError) {
      setError(
        getErrorMessage(submissionError, "We could not create that location.")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            className="h-9 gap-2 rounded-xl px-3 text-xs font-extrabold"
          />
        }
      >
        <MapPinPlusIcon className="size-4" />
        New location
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create location</DialogTitle>
          <DialogDescription>
            Add another workplace under this organisation.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <Field>
            <FieldLabel htmlFor="location-name">Location name</FieldLabel>
            <FieldContent>
              <Input
                id="location-name"
                value={name}
                maxLength={80}
                placeholder="Second bar"
                autoFocus
                onChange={(event) => setName(event.target.value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Initial zones</FieldLabel>
            <FieldContent>
              <div className="space-y-2">
                {zones.map((zone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      aria-label={`Zone ${index + 1} name`}
                      value={zone}
                      maxLength={80}
                      placeholder={index === 0 ? "Main area" : "Another zone"}
                      onChange={(event) =>
                        setZones((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item
                          )
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Remove zone ${index + 1}`}
                      disabled={zones.length === 1}
                      onClick={() =>
                        setZones((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={zones.length >= 12}
                  onClick={() => setZones((current) => [...current, ""])}
                >
                  <PlusIcon className="size-3.5" /> Add zone
                </Button>
              </div>
            </FieldContent>
          </Field>

          <FieldError>{error}</FieldError>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateLocationDialog }

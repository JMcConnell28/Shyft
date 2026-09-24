import { Building2Icon, PlusIcon, XIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StepIntro } from "@/features/onboarding/components/setup-step-intro"

function LocationStep({
  locationName,
  onLocationNameChange,
}: {
  locationName: string
  onLocationNameChange: (value: string) => void
}) {
  return (
    <section>
      <StepIntro
        title="Set up your workspace"
        description="Start with your first location. You can add more locations later."
      />
      <div className="mx-auto max-w-[540px]">
        <div className="space-y-2">
          <Label
            htmlFor="first-location-name"
            className="text-sm font-semibold text-[#24395f]"
          >
            First location name
          </Label>
          <div className="relative">
            <Building2Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#657b9e]" />
            <Input
              id="first-location-name"
              autoFocus
              maxLength={80}
              value={locationName}
              onChange={(event) => onLocationNameChange(event.target.value)}
              placeholder="e.g. Waterfront Bar"
              className="h-11 rounded-xl border-[#cbd9f1] pl-11 text-sm shadow-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ZonesStep({
  zoneNames,
  onZoneNamesChange,
}: {
  zoneNames: Array<string>
  onZoneNamesChange: (value: Array<string>) => void
}) {
  const [newName, setNewName] = React.useState("")

  function addZone() {
    const name = newName.trim()
    if (
      !name ||
      zoneNames.length >= 6 ||
      zoneNames.some((entry) => entry.toLowerCase() === name.toLowerCase())
    )
      return
    onZoneNamesChange([...zoneNames, name])
    setNewName("")
  }

  return (
    <section>
      <StepIntro
        title="Create your zones"
        description="Zones help you organise staff and shifts. Add the areas your team works in."
      />
      <div className="mx-auto max-w-[540px]">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm font-semibold text-[#24395f]">
            Your zones
          </Label>
          <span className="text-xs text-[#657797]">
            {zoneNames.length} of 6
          </span>
        </div>
        <ul className="space-y-2">
          {zoneNames.map((name) => (
            <li
              key={name}
              className="flex min-h-10 items-center justify-between rounded-xl border border-[#dce5f4] px-3 text-sm font-medium text-[#172b55]"
            >
              <span>{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() =>
                  onZoneNamesChange(zoneNames.filter((entry) => entry !== name))
                }
                className="flex size-9 items-center justify-center rounded-lg text-[#697b9b] hover:bg-[#f1f6ff] hover:text-[#1264e9]"
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          <Label
            htmlFor="new-zone"
            className="text-sm font-semibold text-[#24395f]"
          >
            Add a new zone
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-zone"
              value={newName}
              maxLength={80}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  addZone()
                }
              }}
              placeholder="e.g. Bar, Kitchen, Delivery"
              className="h-10 rounded-xl border-[#cbd9f1]"
            />
            <Button
              type="button"
              aria-label="Add zone"
              disabled={zoneNames.length >= 6 || !newName.trim()}
              onClick={addZone}
              className="size-10 rounded-xl bg-[#1264e9]"
            >
              <PlusIcon className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { LocationStep, ZonesStep }

import type { LocationAddress } from "@/features/locations/schemas/location-address-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LocationAddressDraft = Omit<
  LocationAddress,
  "country" | "line2" | "county"
> & {
  line2: string
  county: string
}

function LocationAddressFields({
  value,
  onChange,
  idPrefix,
}: {
  value: LocationAddressDraft
  onChange: (value: LocationAddressDraft) => void
  idPrefix: string
}) {
  function field(
    name: keyof LocationAddressDraft,
    label: string,
    autoComplete: string,
    placeholder?: string
  ) {
    const id = `${idPrefix}-${name}`
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs font-semibold text-[#24395f]">
          {label}
        </Label>
        <Input
          id={id}
          autoComplete={autoComplete}
          maxLength={120}
          value={value[name]}
          placeholder={placeholder}
          onChange={(event) =>
            onChange({ ...value, [name]: event.target.value })
          }
          className="h-10 rounded-lg border-[#d4dff1]"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {field("line1", "Address line 1", "address-line1", "Street address")}
      {field("line2", "Address line 2 (optional)", "address-line2")}
      <div className="grid gap-3 sm:grid-cols-2">
        {field("city", "Town or city", "address-level2")}
        {field("county", "County (optional)", "address-level1")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("postcode", "Postcode", "postal-code")}
        <div className="space-y-1.5">
          <Label
            htmlFor={`${idPrefix}-country`}
            className="text-xs font-semibold text-[#24395f]"
          >
            Country
          </Label>
          <Input
            id={`${idPrefix}-country`}
            value="United Kingdom"
            disabled
            className="h-10 rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}

function toLocationAddress(
  value: LocationAddressDraft
): LocationAddress | null {
  if (!Object.values(value).some((entry) => entry.trim())) return null
  return {
    line1: value.line1.trim(),
    line2: value.line2.trim() || undefined,
    city: value.city.trim(),
    county: value.county.trim() || undefined,
    postcode: value.postcode.trim(),
    country: "GB",
  }
}

function getLocationAddressDraft(
  value: LocationAddress | null
): LocationAddressDraft {
  return {
    line1: value?.line1 ?? "",
    line2: value?.line2 ?? "",
    city: value?.city ?? "",
    county: value?.county ?? "",
    postcode: value?.postcode ?? "",
  }
}

export { getLocationAddressDraft, LocationAddressFields, toLocationAddress }
export type { LocationAddressDraft }

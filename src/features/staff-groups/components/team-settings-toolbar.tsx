"use client"

import { Link } from "@tanstack/react-router"
import {
  FilterIcon,
  Layers3Icon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

import type { StaffGroupSettingsLocation } from "@/features/staff-groups/types"
import type { TeamStatusFilter } from "@/features/staff-groups/utils/team-settings"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

function TeamSettingsToolbar({
  locations,
  selectedLocationId,
  search,
  status,
  workspaceSlug,
  onLocationChange,
  onSearchChange,
  onStatusChange,
}: {
  locations: Array<StaffGroupSettingsLocation>
  selectedLocationId: string
  search: string
  status: TeamStatusFilter
  workspaceSlug: string
  onLocationChange: (locationId: string) => void
  onSearchChange: (value: string) => void
  onStatusChange: (status: TeamStatusFilter) => void
}) {
  return (
    <section className="rounded-xl border border-[#dfe5f0] bg-white p-3 shadow-[0_5px_18px_rgba(30,50,96,0.045)] sm:p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 lg:grid-cols-[minmax(12rem,auto)_auto_1fr_auto_auto] lg:items-center">
        <div className="relative order-1 col-span-2 lg:order-none lg:col-span-1">
          <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#60709a]" />
          <NativeSelect
            aria-label="Team location"
            className="w-full lg:min-w-48 [&_select]:h-10 [&_select]:rounded-lg [&_select]:border-[#dfe5f0] [&_select]:bg-white [&_select]:pr-9 [&_select]:pl-9 [&_select]:text-sm [&_select]:font-semibold"
            value={selectedLocationId}
            onChange={(event) => onLocationChange(event.target.value)}
          >
            {locations.map((location) => (
              <NativeSelectOption key={location.id} value={location.id}>
                {location.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <Button
          render={
            <Link
              to="/app/$workspaceSlug/settings/team/groups"
              params={{ workspaceSlug }}
            />
          }
          variant="outline"
          className="order-2 h-10 justify-center rounded-lg border-[#dfe5f0] px-4 text-[#10204b] lg:order-none"
        >
          <Layers3Icon className="size-4" />
          Groups
        </Button>

        <label className="relative order-4 min-w-0 lg:order-none lg:ml-auto lg:w-full lg:max-w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c87a8]" />
          <Input
            className="h-10 rounded-lg border-[#dfe5f0] bg-white pl-9 text-sm shadow-none"
            placeholder="Search team members"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <div className="relative order-5 lg:order-none">
          <FilterIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#60709a]" />
          <NativeSelect
            aria-label="Filter team members"
            className="w-full lg:w-32 [&_select]:h-10 [&_select]:rounded-lg [&_select]:border-[#dfe5f0] [&_select]:bg-white [&_select]:pr-8 [&_select]:pl-9 [&_select]:text-sm [&_select]:font-semibold"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as TeamStatusFilter)
            }
          >
            <NativeSelectOption value="all">All staff</NativeSelectOption>
            <NativeSelectOption value="active">Active</NativeSelectOption>
            <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
          </NativeSelect>
        </div>

        <Button
          render={<Link to="/onboarding/invite" />}
          className="order-3 h-10 justify-center rounded-lg bg-[#0968f5] px-4 text-white shadow-[0_5px_12px_rgba(9,104,245,0.22)] hover:bg-[#075edc] lg:order-none"
        >
          <PlusIcon className="size-4" />
          Add team member
        </Button>
      </div>
    </section>
  )
}

export { TeamSettingsToolbar }

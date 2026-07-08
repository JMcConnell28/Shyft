import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type {
  ClockStationLocation,
  ClockStationTag,
  ClockStationsPageData,
} from "@/features/clock-stations/types"

type LocationRow = {
  id: string
  name: string
  organization_name: string | null
}

type TagRow = {
  id: string
  is_active: boolean
  label: string
  location_id: string
  ntag_aes_key_hex: string | null
  ntag_last_seen_counter: number
  ntag_public_id: string | null
}

async function getClockStationsPageData(): Promise<ClockStationsPageData> {
  const [locations, tags] = await Promise.all([
    queryMany<LocationRow>(
      `select location.id,
              location.name,
              organization_row.name as organization_name
       from public.locations location
       left join public."organization" organization_row
         on organization_row.id = location.organization_id
       order by organization_row.name nulls last, location.name`,
    ),
    queryMany<TagRow>(
      `select id,
              location_id,
              label,
              is_active,
              ntag_public_id,
              ntag_aes_key_hex,
              ntag_last_seen_counter
       from public.clock_tags
       order by created_at desc`,
    ),
  ])

  return {
    locations: locations.map(mapLocation),
    tags: tags.map(mapTag),
  }
}

function mapLocation(row: LocationRow): ClockStationLocation {
  return {
    id: row.id,
    name: row.name,
    organizationName: row.organization_name,
  }
}

function mapTag(row: TagRow): ClockStationTag {
  return {
    aesKeyHex: row.ntag_aes_key_hex,
    id: row.id,
    isActive: row.is_active,
    label: row.label,
    lastSeenCounter: row.ntag_last_seen_counter,
    locationId: row.location_id,
    publicId: row.ntag_public_id,
  }
}

export { getClockStationsPageData }

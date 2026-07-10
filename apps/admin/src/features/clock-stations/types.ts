type ClockStationLocation = {
  id: string
  name: string
  organizationName: string | null
}

type ClockStationTag = {
  aesKeyHex: string | null
  id: string
  isActive: boolean
  label: string
  lastSeenCounter: number
  locationId: string
  publicId: string | null
}

type ClockStationsPageData = {
  locations: ClockStationLocation[]
  tags: ClockStationTag[]
}

export type { ClockStationLocation, ClockStationTag, ClockStationsPageData }

type ProductEvent = {
  actorUserId: string | null
  createdAt: string
  eventType: string
  id: string
  locationId: string | null
  organizationId: string | null
  targetId: string | null
  targetType: string | null
}

type EventsPageData = {
  events: ProductEvent[]
}

export type { EventsPageData, ProductEvent }

import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type { EventsPageData, ProductEvent } from "@/features/events/types"

type EventRow = {
  actor_user_id: string | null
  created_at: Date | string
  event_type: string
  id: string
  location_id: string | null
  organization_id: string | null
  target_id: string | null
  target_type: string | null
}

async function listProductEvents(): Promise<EventsPageData> {
  const rows = await queryMany<EventRow>(
    `select id,
            event_type,
            actor_user_id,
            organization_id,
            location_id,
            target_type,
            target_id,
            created_at
     from admin_private.app_events
     order by created_at desc
     limit 250`,
  )

  return {
    events: rows.map(mapEvent),
  }
}

function mapEvent(row: EventRow): ProductEvent {
  return {
    actorUserId: row.actor_user_id,
    createdAt: new Date(row.created_at).toISOString(),
    eventType: row.event_type,
    id: row.id,
    locationId: row.location_id,
    organizationId: row.organization_id,
    targetId: row.target_id,
    targetType: row.target_type,
  }
}

export { listProductEvents }

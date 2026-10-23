import "@tanstack/react-start/server-only"
import { queryMany } from "@rocketrota/db"
import type { StationRequest } from "../types"

type RequestRow = {
  request_id: string
  location_id: string
  source: "included" | "additional"
  clock_tag_id: string | null
  payment_status: string
  is_live: boolean
  paid_at: Date | null
  needs_station: boolean
  fulfillment_status: string
  fulfillment_reference: string | null
  fulfillment_notes: string | null
  shipped_at: Date | null
  delivery_name: string | null
  delivery_line1: string | null
  delivery_line2: string | null
  delivery_city: string | null
  delivery_county: string | null
  delivery_postcode: string | null
  delivery_country: string | null
}
async function listCustomerStationRequests(
  customerId: string
): Promise<Array<StationRequest>> {
  const rows = await queryMany<RequestRow>(
    `select request_id, location_id, source, clock_tag_id, payment_status, is_live, paid_at, needs_station,
      fulfillment_status, fulfillment_reference, fulfillment_notes, shipped_at,
      delivery_name, delivery_line1, delivery_line2, delivery_city, delivery_county, delivery_postcode, delivery_country
     from billing_private.station_fulfillment_requests
     where ($1 like 'org:%' and organization_id = substring($1 from 5))
       or ($1 like 'account:%' and billing_account_id::text = substring($1 from 9))
     order by source desc, paid_at nulls last, request_id`,
    [customerId]
  )
  return rows.map((row) => ({
    id: row.request_id,
    locationId: row.location_id,
    source: row.source,
    clockTagId: row.clock_tag_id,
    paymentStatus: row.payment_status,
    isLive: row.is_live,
    paymentConfirmedAt: row.paid_at?.toISOString() ?? null,
    needsStation: row.needs_station,
    fulfillmentStatus: row.fulfillment_status,
    reference: row.fulfillment_reference,
    notes: row.fulfillment_notes,
    shippedAt: row.shipped_at?.toISOString() ?? null,
    deliveryAddress: [
      row.delivery_name,
      row.delivery_line1,
      row.delivery_line2,
      row.delivery_city,
      row.delivery_county,
      row.delivery_postcode,
      row.delivery_country,
    ].filter((part): part is string => Boolean(part)),
  }))
}
export { listCustomerStationRequests }

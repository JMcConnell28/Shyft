import "@tanstack/react-start/server-only"
import { queryMany, queryOne } from "@rocketrota/db"

import { listCustomerStationRequests } from "./station-requests"
import { customerSourceSql } from "./customer-source"
import type { CustomerListInput } from "../schemas"
import type {
  CustomerDetail,
  CustomerListData,
  CustomerStage,
  CustomerSummary,
  StationQueueItem,
} from "../types"

type CustomerRow = {
  id: string
  name: string
  email: string | null
  stage: CustomerStage
  created_at: Date
  trial_ends_at: Date | null
  location_count: string
  addon_count: string
  stations_needed: string
}

function mapCustomer(row: CustomerRow): CustomerSummary {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    stage: row.stage,
    createdAt: row.created_at.toISOString(),
    trialEndsAt: row.trial_ends_at?.toISOString() ?? null,
    locationCount: Number(row.location_count),
    addonCount: Number(row.addon_count),
    stationsNeeded: Number(row.stations_needed),
  }
}

async function listCustomers(
  input: CustomerListInput
): Promise<CustomerListData> {
  const filter = `from customer_data where ($1 = '' or name ilike '%' || $1 || '%' or email ilike '%' || $1 || '%') and ($2 = 'all' or stage = $2)`
  const values = [input.search, input.stage]
  const [rows, count] = await Promise.all([
    queryMany<CustomerRow>(
      `${customerSourceSql} select * ${filter} order by created_at desc, id limit 50 offset $3`,
      [...values, (input.page - 1) * 50]
    ),
    queryOne<{ total: string }>(
      `${customerSourceSql} select count(*) as total ${filter}`,
      values
    ),
  ])
  return { customers: rows.map(mapCustomer), total: Number(count?.total ?? 0) }
}

type LocationRow = {
  location_id: string
  location_name: string
  trial_ends_at: Date | null
  subscription_status: string | null
  addon_status: string | null
  fulfillment_status: string | null
  paid_at: Date | null
  stripe_invoice_id: string | null
  needs_station: boolean
  delivery_name: string | null
  delivery_line1: string | null
  delivery_line2: string | null
  delivery_city: string | null
  delivery_county: string | null
  delivery_postcode: string | null
  delivery_country: string | null
  fulfillment_reference: string | null
  fulfillment_notes: string | null
  shipped_at: Date | null
}

async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const customer = await queryOne<CustomerRow>(
    `${customerSourceSql} select * from customer_data where id = $1`,
    [id]
  )
  if (!customer) return null
  const locations = await queryMany<LocationRow>(
    `select * from billing_private.clock_station_fulfillment
     where ($1 like 'org:%' and organization_id = substring($1 from 5))
        or ($1 like 'account:%' and billing_account_id::text = substring($1 from 9))
     order by location_name, location_id`,
    [id]
  )
  const requests = await listCustomerStationRequests(id)
  return {
    customer: mapCustomer(customer),
    locations: locations.map((row) => ({
      requests: requests.filter(
        (request) => request.locationId === row.location_id
      ),
      id: row.location_id,
      name: row.location_name,
      trialEndsAt: row.trial_ends_at?.toISOString() ?? null,
      billingStatus: row.subscription_status,
      addonStatus: row.addon_status,
      fulfillmentStatus: row.fulfillment_status,
      paymentConfirmedAt: row.paid_at?.toISOString() ?? null,
      invoiceId: row.stripe_invoice_id,
      needsStation: row.needs_station,
      deliveryAddress: [
        row.delivery_name,
        row.delivery_line1,
        row.delivery_line2,
        row.delivery_city,
        row.delivery_county,
        row.delivery_postcode,
        row.delivery_country,
      ].filter((part): part is string => Boolean(part)),
      reference: row.fulfillment_reference,
      notes: row.fulfillment_notes,
      shippedAt: row.shipped_at?.toISOString() ?? null,
    })),
  }
}

async function listStationQueue(): Promise<Array<StationQueueItem>> {
  const rows = await queryMany<{
    request_id: string
    source: "included" | "additional"
    customer_id: string
    customer_name: string
    location_id: string
    location_name: string
    has_tag: boolean
    paid_at: Date
  }>(
    `select s.request_id, s.source, case when s.organization_id is not null then 'org:' || s.organization_id else 'account:' || s.billing_account_id::text end as customer_id,
            coalesce(o.name, s.location_name) as customer_name, s.location_id, s.location_name, s.paid_at,
            exists(select 1 from public.clock_tags t where t.id = s.clock_tag_id and t.location_id = s.location_id and t.is_active and t.ntag_public_id is not null and t.ntag_aes_key_hex is not null) as has_tag
     from billing_private.station_fulfillment_requests s
     left join public.organization o on o.id = s.organization_id
     where s.needs_station order by s.paid_at, s.location_id`
  )
  return rows.map((row) => ({
    requestId: row.request_id,
    source: row.source,
    customerId: row.customer_id,
    customerName: row.customer_name,
    locationId: row.location_id,
    locationName: row.location_name,
    hasTag: row.has_tag,
    paidAt: row.paid_at.toISOString(),
  }))
}

async function countStationQueue(): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `select count(*) from billing_private.station_fulfillment_requests where needs_station`
  )
  return Number(row?.count ?? 0)
}

export { listCustomers, getCustomerDetail, listStationQueue, countStationQueue }

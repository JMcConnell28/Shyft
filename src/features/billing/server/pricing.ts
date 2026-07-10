import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import {
  getCoreBasePriceId,
  getCoreExtraEmployeePriceId,
  getTimeAttendanceEmployeePriceId,
} from "@/features/billing/server/stripe"
import {
  INCLUDED_CORE_EMPLOYEES,
  calculateBillingSeatQuantities,
} from "@/features/billing/utils/pricing-quantities"
import { getDatabase } from "@/lib/db"

type BillingPricingQuantities = {
  locationQuantity: number
  usedEmployeeQuantity: number
  includedEmployeeQuantity: number
  extraEmployeeQuantity: number
  timeAttendanceQuantity: number
  locations: Array<LocationPricingQuantity>
}

type LocationPricingQuantity = {
  locationId: string
  locationName: string
  usedEmployeeCount: number
  includedEmployeeCount: number
  extraEmployeeCount: number
  timeAttendanceEnabled: boolean
  timeAttendanceStatus:
    | "legacy_pending"
    | "trialing"
    | "active"
    | "canceling"
    | "canceled"
    | null
  timeAttendanceCancelAt: string | null
  hardwareEntitlementAvailable: boolean
}

type BillingAccountScopeRow = {
  organization_id: string | null
}

type BillingLocationRow = {
  location_id: string
  location_name: string
  used_employee_count: number | string
  time_attendance_enabled: boolean
  time_attendance_status: LocationPricingQuantity["timeAttendanceStatus"]
  time_attendance_cancel_at: Date | string | null
  hardware_entitlement_available: boolean
}

type BillingEmployeeCountRow = {
  used_employee_count: number | string
  time_attendance_employee_count: number | string
}

async function getBillingPricingQuantities(
  billingAccountId: string
): Promise<BillingPricingQuantities> {
  const organizationId = await getBillingAccountOrganizationId(billingAccountId)

  if (!organizationId) {
    return getEmptyBillingPricingQuantities()
  }

  const [locations, employeeCounts] = await Promise.all([
    getLocationPricingQuantities(organizationId),
    getEmployeeCounts(organizationId),
  ])
  const usedEmployeeQuantity = Number(employeeCounts.used_employee_count)
  const timeAttendanceQuantity = Number(
    employeeCounts.time_attendance_employee_count
  )
  const locationQuantity = Math.max(locations.length, 1)
  const seatQuantities = calculateBillingSeatQuantities(usedEmployeeQuantity)

  return {
    locationQuantity,
    usedEmployeeQuantity,
    includedEmployeeQuantity: seatQuantities.includedEmployeeQuantity,
    extraEmployeeQuantity: seatQuantities.extraEmployeeQuantity,
    timeAttendanceQuantity,
    locations,
  }
}

async function getBillingAccountOrganizationId(billingAccountId: string) {
  const result = await getDatabase().query<BillingAccountScopeRow>(
    `select coalesce(account.organization_id, location.organization_id) as organization_id
     from public.billing_accounts account
     left join public.locations location on location.billing_account_id = account.id
     where account.id = $1
     limit 1`,
    [billingAccountId]
  )

  return result.rows.at(0)?.organization_id ?? null
}

async function getLocationPricingQuantities(organizationId: string) {
  const result = await getDatabase().query<BillingLocationRow>(
    `with current_period as (
       select period.id
       from billing_private.organization_billing_periods period
       where period.organization_id = $1
         and period.period_start <= timezone('utc', now())
         and timezone('utc', now()) < period.period_end
       order by period.period_start desc
       limit 1
     ),
     location_employee_counts as (
       select usage.location_id,
              count(distinct usage.employee_id)::integer as used_employee_count
       from billing_private.organization_employee_usage_events usage
       join current_period period on period.id = usage.organization_billing_period_id
       group by usage.location_id
     )
     select
       location.id as location_id,
       location.name as location_name,
       coalesce(counts.used_employee_count, 0) as used_employee_count,
       coalesce(addon.status in ('trialing', 'active', 'canceling'), false) as time_attendance_enabled,
       addon.status as time_attendance_status,
       addon.cancel_at as time_attendance_cancel_at,
       coalesce(hardware.entitlement_status = 'available', false) as hardware_entitlement_available
     from public.locations location
     left join location_employee_counts counts on counts.location_id = location.id
     left join billing_private.location_addons addon
       on addon.location_id = location.id
      and addon.addon_type = 'time_attendance'
     left join billing_private.location_hardware_entitlements hardware
       on hardware.location_id = location.id
     where location.organization_id = $1
     order by location.created_at, location.name`,
    [organizationId]
  )

  return result.rows.map((row): LocationPricingQuantity => {
    const employeeCount = Number(row.used_employee_count)

    return {
      locationId: row.location_id,
      locationName: row.location_name,
      usedEmployeeCount: employeeCount,
      includedEmployeeCount: 0,
      extraEmployeeCount: 0,
      timeAttendanceEnabled: row.time_attendance_enabled,
      timeAttendanceStatus: row.time_attendance_status,
      timeAttendanceCancelAt: row.time_attendance_cancel_at
        ? new Date(row.time_attendance_cancel_at).toISOString()
        : null,
      hardwareEntitlementAvailable: row.hardware_entitlement_available,
    }
  })
}

async function getEmployeeCounts(organizationId: string) {
  const result = await getDatabase().query<BillingEmployeeCountRow>(
    `with current_period as (
       select period.id
       from billing_private.organization_billing_periods period
       where period.organization_id = $1
         and period.period_start <= timezone('utc', now())
         and timezone('utc', now()) < period.period_end
       order by period.period_start desc
       limit 1
     )
     select
       (
         select count(distinct usage.employee_id)::integer
         from billing_private.organization_employee_usage_events usage
         join current_period period on period.id = usage.organization_billing_period_id
       ) as used_employee_count,
       (
         select count(distinct usage.employee_id)::integer
         from billing_private.organization_employee_usage_events usage
         join current_period period on period.id = usage.organization_billing_period_id
         where usage.time_attendance_billable = true
       ) as time_attendance_employee_count`,
    [organizationId]
  )

  return (
    result.rows.at(0) ?? {
      used_employee_count: 0,
      time_attendance_employee_count: 0,
    }
  )
}

function getEmptyBillingPricingQuantities(): BillingPricingQuantities {
  return {
    locationQuantity: 1,
    usedEmployeeQuantity: 0,
    includedEmployeeQuantity: INCLUDED_CORE_EMPLOYEES,
    extraEmployeeQuantity: 0,
    timeAttendanceQuantity: 0,
    locations: [],
  }
}

function buildSubscriptionLineItems(
  _quantities: BillingPricingQuantities
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: getCoreBasePriceId(),
      quantity: 1,
    },
  ]

  lineItems.push({ price: getCoreExtraEmployeePriceId() })
  lineItems.push({ price: getTimeAttendanceEmployeePriceId() })

  return lineItems
}

function buildSubscriptionItems(
  _quantities: BillingPricingQuantities
): Stripe.SubscriptionCreateParams.Item[] {
  const items: Stripe.SubscriptionCreateParams.Item[] = [
    {
      price: getCoreBasePriceId(),
      quantity: 1,
    },
  ]

  items.push({ price: getCoreExtraEmployeePriceId() })
  items.push({ price: getTimeAttendanceEmployeePriceId() })

  return items
}

export {
  INCLUDED_CORE_EMPLOYEES,
  buildSubscriptionLineItems,
  buildSubscriptionItems,
  getBillingPricingQuantities,
}
export type { BillingPricingQuantities }
export type { LocationPricingQuantity }

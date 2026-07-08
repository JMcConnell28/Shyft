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
  activeEmployeeQuantity: number
  includedEmployeeQuantity: number
  extraEmployeeQuantity: number
  timeAttendanceQuantity: number
  locations: Array<LocationPricingQuantity>
}

type LocationPricingQuantity = {
  locationId: string
  locationName: string
  employeeHighWaterCount: number
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
  active_employee_count: number | string
  time_attendance_enabled: boolean
  time_attendance_status: LocationPricingQuantity["timeAttendanceStatus"]
  time_attendance_cancel_at: Date | string | null
  hardware_entitlement_available: boolean
}

type BillingEmployeeCountRow = {
  active_employee_count: number | string
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
  const activeEmployeeQuantity = Number(employeeCounts.active_employee_count)
  const timeAttendanceQuantity = Number(
    employeeCounts.time_attendance_employee_count
  )
  const locationQuantity = Math.max(locations.length, 1)
  const seatQuantities = calculateBillingSeatQuantities(
    activeEmployeeQuantity
  )

  return {
    locationQuantity,
    activeEmployeeQuantity,
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
    `with location_employee_counts as (
       select
         location.id as location_id,
         count(distinct employee.id)::integer as active_employee_count
       from public.locations location
       left join public.employee_location_assignments assignment
         on assignment.location_id = location.id
        and assignment.is_enabled = true
        and assignment.disabled_at is null
       left join public.employees employee
         on employee.organization_id = location.organization_id
        and employee.status = 'active'
        and (
          employee.location_id = location.id
          or employee.id = assignment.employee_id
        )
       where location.organization_id = $1
       group by location.id
     )
     select
       location.id as location_id,
       location.name as location_name,
       coalesce(counts.active_employee_count, 0) as active_employee_count,
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
    const employeeCount = Number(row.active_employee_count)

    return {
      locationId: row.location_id,
      locationName: row.location_name,
      employeeHighWaterCount: employeeCount,
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
    `with time_attendance_locations as (
       select addon.location_id
       from billing_private.location_addons addon
       join public.locations location on location.id = addon.location_id
       where location.organization_id = $1
         and addon.addon_type = 'time_attendance'
         and addon.status in ('trialing', 'active', 'canceling')
     ),
     assigned_time_attendance_employees as (
       select employee.id
       from public.employees employee
       join time_attendance_locations location
         on location.location_id = employee.location_id
       where employee.organization_id = $1
         and employee.status = 'active'

       union

       select employee.id
       from public.employee_location_assignments assignment
       join public.employees employee on employee.id = assignment.employee_id
       join time_attendance_locations location
         on location.location_id = assignment.location_id
       where employee.organization_id = $1
         and employee.status = 'active'
         and assignment.is_enabled = true
         and assignment.disabled_at is null
     ),
     active_assigned_employees as (
       select employee.id
       from public.employees employee
       where employee.organization_id = $1
         and employee.location_id is not null
         and employee.status = 'active'

       union

       select employee.id
       from public.employee_location_assignments assignment
       join public.employees employee on employee.id = assignment.employee_id
       where employee.organization_id = $1
         and employee.status = 'active'
         and assignment.is_enabled = true
         and assignment.disabled_at is null
     )
     select
       (
         select count(distinct id)::integer
         from active_assigned_employees
       ) as active_employee_count,
       (
         select count(distinct id)::integer
         from assigned_time_attendance_employees
       ) as time_attendance_employee_count`,
    [organizationId]
  )

  return (
    result.rows.at(0) ?? {
      active_employee_count: 0,
      time_attendance_employee_count: 0,
    }
  )
}

function getEmptyBillingPricingQuantities(): BillingPricingQuantities {
  return {
    locationQuantity: 1,
    activeEmployeeQuantity: 0,
    includedEmployeeQuantity: INCLUDED_CORE_EMPLOYEES,
    extraEmployeeQuantity: 0,
    timeAttendanceQuantity: 0,
    locations: [],
  }
}

function buildSubscriptionLineItems(
  quantities: BillingPricingQuantities
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: getCoreBasePriceId(),
      quantity: 1,
    },
  ]

  if (quantities.extraEmployeeQuantity > 0) {
    lineItems.push({
      price: getCoreExtraEmployeePriceId(),
      quantity: quantities.extraEmployeeQuantity,
    })
  }

  if (quantities.timeAttendanceQuantity > 0) {
    lineItems.push({
      price: getTimeAttendanceEmployeePriceId(),
      quantity: quantities.timeAttendanceQuantity,
    })
  }

  return lineItems
}

function buildSubscriptionItems(
  quantities: BillingPricingQuantities
): Stripe.SubscriptionCreateParams.Item[] {
  const items: Stripe.SubscriptionCreateParams.Item[] = [
    {
      price: getCoreBasePriceId(),
      quantity: 1,
    },
  ]

  if (quantities.extraEmployeeQuantity > 0) {
    items.push({
      price: getCoreExtraEmployeePriceId(),
      quantity: quantities.extraEmployeeQuantity,
    })
  }

  if (quantities.timeAttendanceQuantity > 0) {
    items.push({
      price: getTimeAttendanceEmployeePriceId(),
      quantity: quantities.timeAttendanceQuantity,
    })
  }

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

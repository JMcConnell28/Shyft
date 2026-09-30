import { getDatabase } from "@/lib/db"

type WorkspaceRotaLocation = {
  id: string
  name: string
  slug: string
  estimatedClosingTime: string | null
  estimatedClosingTimeNextDay: boolean | null
}

async function getAccessibleWorkspaceLocation({
  organizationId,
  locationSlug,
  userId,
  canViewManagedLocations,
}: {
  organizationId: string
  locationSlug: string
  userId: string
  canViewManagedLocations: boolean
}): Promise<WorkspaceRotaLocation | null> {
  const result = await getDatabase().query<{
    id: string
    name: string
    slug: string
    estimated_closing_time: string | null
    estimated_closing_time_next_day: boolean | null
  }>(
    `select location.id,
            location.name,
            location.slug,
            location.estimated_closing_time,
            location.estimated_closing_time_next_day
     from public.locations location
     where location.organization_id = $1
       and location.slug = $2
       and (
         $4::boolean
         or exists (
           select 1
           from public.employees employee
           join public.employee_location_assignments assignment
             on assignment.employee_id = employee.id
           where employee.organization_id = $1
             and employee.user_id = $3
             and employee.status = 'active'
             and assignment.organization_id = $1
             and assignment.location_id = location.id
             and assignment.is_enabled = true
             and assignment.disabled_at is null
         )
       )
     limit 1`,
    [organizationId, locationSlug, userId, canViewManagedLocations]
  )
  const location = result.rows.at(0)

  return location
    ? {
        id: location.id,
        name: location.name,
        slug: location.slug,
        estimatedClosingTime: location.estimated_closing_time,
        estimatedClosingTimeNextDay: location.estimated_closing_time_next_day,
      }
    : null
}

export { getAccessibleWorkspaceLocation }

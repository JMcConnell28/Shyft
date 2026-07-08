import type {
  CompanyEmployeeDetail,
  CompanyEmployeeNoteLocationOption,
  CompanyEmployeeNoteZoneOption,
  CompanyEmployeeListItem,
  CompanyEmployeesPageData,
  CompanyEmployeePageData,
  CompanyEmployeeRotaNote,
  CompanyEmployeeRotaNoteCategory,
  CompanyEmployeeRotaNotePriority,
  CompanyRole,
} from "@/features/company/types"
import { requireCompanyAdminContext } from "@/features/company/server/shared"
import { getMinimumWagePenceForDateOfBirth } from "@/features/staff-groups/utils/minimum-wage"
import { getDatabase } from "@/lib/db"

type EmployeeRow = {
  active_location_count: string | number
  email: string | null
  full_name: string
  group_name: string | null
  hourly_rate_pence: number | null
  id: string
  location_count: string | number
  pay_type: string | null
  payroll_id: string | null
  role: string | null
  status: string
  user_id: string | null
  weekly_salary_pence: number | null
  dateOfBirth: string | null
}

type LocationRow = {
  id: string
  is_active: boolean
  name: string
}

type NoteLocationRow = {
  id: string
  name: string
}

type NoteZoneRow = {
  id: string
  location_id: string
  name: string
}

type EmployeeRotaNoteRow = {
  body: string
  category: string
  created_at: string
  id: string
  is_pinned: boolean
  location_id: string | null
  location_name: string | null
  priority: string
  title: string
  updated_at: string
  zone_id: string | null
  zone_name: string | null
}

async function getCompanyEmployeesPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<CompanyEmployeesPageData> {
  const context = await requireCompanyAdminContext(input)
  const [workspaceName, employees] = await Promise.all([
    getWorkspaceName(context),
    listCompanyEmployees(context),
  ])

  return {
    employees: employees.map(mapListEmployee),
    workspaceName,
  }
}

async function getCompanyEmployeePageData(input: {
  employeeId: string
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<CompanyEmployeePageData> {
  const context = await requireCompanyAdminContext(input)
  const [
    workspaceName,
    employee,
    locations,
    rotaNotes,
    noteLocations,
    noteZones,
  ] = await Promise.all([
    getWorkspaceName(context),
    getCompanyEmployee(context, input.employeeId),
    listEmployeeLocations(context, input.employeeId),
    listEmployeeRotaNotes(context, input.employeeId),
    listRotaNoteLocations(context),
    listRotaNoteZones(context),
  ])

  return {
    employee: {
      ...mapDetailEmployee(employee),
      locations: locations.map((location) => ({
        id: location.id,
        isActive: location.is_active,
        name: location.name,
      })),
      rotaNoteLocations: noteLocations.map(mapNoteLocation),
      rotaNotes: rotaNotes.map(mapEmployeeRotaNote),
      rotaNoteZones: noteZones.map(mapNoteZone),
    },
    workspaceName,
  }
}

async function getWorkspaceName(context: {
  organizationId: string | null
  locationId: string | null
}) {
  if (context.organizationId) {
    const result = await getDatabase().query<{ name: string }>(
      `select name from public.organization where id = $1 limit 1`,
      [context.organizationId]
    )

    return result.rows.at(0)?.name ?? "Company"
  }

  const result = await getDatabase().query<{ name: string }>(
    `select name from public.locations where id = $1::uuid limit 1`,
    [context.locationId]
  )

  return result.rows.at(0)?.name ?? "Company"
}

async function listCompanyEmployees(context: {
  organizationId: string | null
  locationId: string | null
}) {
  const result = context.organizationId
    ? await getDatabase().query<EmployeeRow>(
        `select employee.id,
                employee.full_name,
                employee.email,
                employee.payroll_id,
                employee.status,
                employee.user_id,
                staff_group.name as group_name,
                compensation.pay_type,
                compensation.hourly_rate_pence,
                compensation.weekly_salary_pence,
                account_user."dateOfBirth",
                member.role,
                (
                  select count(*)
                  from public.locations location
                  where location.organization_id = $1::text
                ) as location_count,
                count(assignment.location_id) filter (
                  where assignment.is_enabled = true
                    and assignment.disabled_at is null
                ) as active_location_count
         from public.employees employee
         left join public.staff_groups staff_group on staff_group.id = employee.staff_group_id
         left join public.employee_compensation compensation on compensation.employee_id = employee.id
         left join public."user" account_user on account_user.id = employee.user_id
         left join public."member" member
           on member."organizationId" = employee.organization_id
          and member."userId" = employee.user_id
         left join public.employee_location_assignments assignment
           on assignment.employee_id = employee.id
          and assignment.organization_id = employee.organization_id
         where employee.organization_id = $1::text
         group by employee.id, staff_group.name, compensation.pay_type,
                  compensation.hourly_rate_pence, compensation.weekly_salary_pence,
                  account_user."dateOfBirth", member.role
         order by employee.full_name asc`,
        [context.organizationId]
      )
    : await getDatabase().query<EmployeeRow>(
        `select employee.id,
                employee.full_name,
               employee.email,
                employee.payroll_id,
               employee.status,
                employee.user_id,
                staff_group.name as group_name,
                compensation.pay_type,
                compensation.hourly_rate_pence,
                compensation.weekly_salary_pence,
                account_user."dateOfBirth",
                membership.role,
                1 as location_count,
                case
                  when assignment.is_enabled = true and assignment.disabled_at is null then 1
                  else 0
                end as active_location_count
         from public.employees employee
         left join public.staff_groups staff_group on staff_group.id = employee.staff_group_id
         left join public.employee_compensation compensation on compensation.employee_id = employee.id
         left join public."user" account_user on account_user.id = employee.user_id
         left join public.location_memberships membership
           on membership.location_id = employee.location_id
          and membership.user_id = employee.user_id
         left join public.employee_location_assignments assignment
           on assignment.employee_id = employee.id
          and assignment.location_id = employee.location_id
         where employee.organization_id is null
           and employee.location_id = $1::uuid
         order by employee.full_name asc`,
        [context.locationId]
      )

  return result.rows
}

async function getCompanyEmployee(
  context: { organizationId: string | null; locationId: string | null },
  employeeId: string
) {
  const employees = await listCompanyEmployees(context)
  const employee = employees.find((entry) => entry.id === employeeId) ?? null

  if (!employee) {
    throw new Error("That employee could not be found.")
  }

  return employee
}

async function listEmployeeLocations(
  context: { organizationId: string | null; locationId: string | null },
  employeeId: string
) {
  if (context.organizationId) {
    const result = await getDatabase().query<LocationRow>(
      `select location.id,
              location.name,
              coalesce(
                assignment.is_enabled = true and assignment.disabled_at is null,
                false
              ) as is_active
       from public.locations location
       left join public.employee_location_assignments assignment
         on assignment.location_id = location.id
        and assignment.employee_id = $2::uuid
       where location.organization_id = $1::text
       order by location.created_at asc, location.name asc`,
      [context.organizationId, employeeId]
    )

    return result.rows
  }

  const result = await getDatabase().query<LocationRow>(
    `select location.id,
            location.name,
            coalesce(
              assignment.is_enabled = true and assignment.disabled_at is null,
              false
            ) as is_active
     from public.locations location
     left join public.employee_location_assignments assignment
       on assignment.location_id = location.id
      and assignment.employee_id = $2::uuid
     where location.id = $1::uuid`,
    [context.locationId, employeeId]
  )

  return result.rows
}

async function listRotaNoteLocations(context: {
  organizationId: string | null
  locationId: string | null
}) {
  const result = context.organizationId
    ? await getDatabase().query<NoteLocationRow>(
        `select id, name
         from public.locations
         where organization_id = $1::text
         order by created_at asc, name asc`,
        [context.organizationId]
      )
    : await getDatabase().query<NoteLocationRow>(
        `select id, name
         from public.locations
         where id = $1::uuid
         order by created_at asc, name asc`,
        [context.locationId]
      )

  return result.rows
}

async function listRotaNoteZones(context: {
  organizationId: string | null
  locationId: string | null
}) {
  const result = context.organizationId
    ? await getDatabase().query<NoteZoneRow>(
        `select zone.id, zone.location_id, zone.name
         from public.zones zone
         join public.locations location on location.id = zone.location_id
         where location.organization_id = $1::text
           and zone.deleted_at is null
         order by location.created_at asc, zone.sort_order asc, zone.name asc`,
        [context.organizationId]
      )
    : await getDatabase().query<NoteZoneRow>(
        `select id, location_id, name
         from public.zones
         where location_id = $1::uuid
           and deleted_at is null
         order by sort_order asc, name asc`,
        [context.locationId]
      )

  return result.rows
}

async function listEmployeeRotaNotes(
  context: { organizationId: string | null; locationId: string | null },
  employeeId: string
) {
  const result = await getDatabase().query<EmployeeRotaNoteRow>(
    `select note.id,
            note.category,
            note.title,
            note.body,
            note.priority,
            note.is_pinned,
            note.location_id,
            location.name as location_name,
            note.zone_id,
            zone.name as zone_name,
            note.created_at,
            note.updated_at
     from public.employee_rota_notes note
     left join public.locations location on location.id = note.location_id
     left join public.zones zone on zone.id = note.zone_id
     where note.employee_id = $3::uuid
       and note.status = 'active'
       and (
         ($1::text is not null and note.organization_id = $1::text)
         or (
           $1::text is null
           and exists (
             select 1
             from public.locations scoped_location
             where scoped_location.id = $2::uuid
               and scoped_location.organization_id = note.organization_id
           )
         )
       )
     order by note.is_pinned desc,
              case note.priority
                when 'high' then 1
                when 'normal' then 2
                else 3
              end,
              note.updated_at desc`,
    [context.organizationId, context.locationId, employeeId]
  )

  return result.rows
}

function mapListEmployee(employee: EmployeeRow): CompanyEmployeeListItem {
  return {
    activeLocationCount: Number(employee.active_location_count),
    email: employee.email,
    groupName: employee.group_name,
    id: employee.id,
    locationCount: Number(employee.location_count),
    name: employee.full_name,
    payrollId: employee.payroll_id,
    role: normalizeRole(employee.role),
    status: employee.status === "inactive" ? "inactive" : "active",
  }
}

function mapDetailEmployee(
  employee: EmployeeRow
): Omit<
  CompanyEmployeeDetail,
  "locations" | "rotaNoteLocations" | "rotaNotes" | "rotaNoteZones"
> {
  return {
    ...mapListEmployee(employee),
    compensation:
      employee.pay_type === "salary"
        ? {
            type: "salary",
            weeklySalaryPence: employee.weekly_salary_pence ?? 0,
          }
        : {
            type: "hourly",
            hourlyRatePence:
              employee.hourly_rate_pence ??
              getMinimumWagePenceForDateOfBirth(employee.dateOfBirth),
          },
    userId: employee.user_id,
  }
}

function mapEmployeeRotaNote(row: EmployeeRotaNoteRow): CompanyEmployeeRotaNote {
  return {
    body: row.body,
    category: normalizeNoteCategory(row.category),
    createdAt: row.created_at,
    id: row.id,
    isPinned: row.is_pinned,
    locationId: row.location_id,
    locationName: row.location_name,
    priority: normalizeNotePriority(row.priority),
    title: row.title,
    updatedAt: row.updated_at,
    zoneId: row.zone_id,
    zoneName: row.zone_name,
  }
}

function mapNoteLocation(
  row: NoteLocationRow
): CompanyEmployeeNoteLocationOption {
  return {
    id: row.id,
    name: row.name,
  }
}

function mapNoteZone(row: NoteZoneRow): CompanyEmployeeNoteZoneOption {
  return {
    id: row.id,
    locationId: row.location_id,
    name: row.name,
  }
}

function normalizeNoteCategory(
  category: string
): CompanyEmployeeRotaNoteCategory {
  if (
    category === "skill" ||
    category === "constraint" ||
    category === "preference" ||
    category === "warning"
  ) {
    return category
  }

  return "general"
}

function normalizeNotePriority(
  priority: string
): CompanyEmployeeRotaNotePriority {
  if (priority === "low" || priority === "high") {
    return priority
  }

  return "normal"
}

function normalizeRole(role: string | null): CompanyRole | null {
  if (!role) {
    return null
  }

  if (role.includes(",")) {
    return normalizeRole(role.split(",")[0]?.trim() ?? null)
  }

  if (
    role === "owner" ||
    role === "admin" ||
    role === "manager" ||
    role === "supervisor" ||
    role === "employee" ||
    role === "member"
  ) {
    return role
  }

  return null
}

export { getCompanyEmployeePageData, getCompanyEmployeesPageData }

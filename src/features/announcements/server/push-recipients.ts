import "@tanstack/react-start/server-only"

import { z } from "zod"

import { getDatabase } from "@/lib/db"

const recipientSchema = z.object({
  userId: z.string(),
  workspaceSlug: z.string(),
})
type AnnouncementPushRecipient = z.infer<typeof recipientSchema>

async function listAnnouncementPushRecipients(
  announcementId: string
): Promise<Array<AnnouncementPushRecipient>> {
  const result = await getDatabase().query<{
    userId: unknown
    workspaceSlug: unknown
  }>(
    `select distinct member."userId" as "userId", organization.slug as "workspaceSlug"
     from public.announcements announcement
     join public."organization" organization on organization.id = announcement.organization_id
     join public."member" member on member."organizationId" = organization.id
     left join account_private.user_preferences preference on preference.user_id = member."userId"
     where announcement.id = $1::uuid
       and announcement.status = 'active'
       and member."userId" <> announcement.author_user_id
       and coalesce(preference.announcement_push_enabled, true)
       and (
         (member.role in ('owner', 'admin') and (
           announcement.target_scope = 'organization'
           or exists (
             select 1 from public.announcement_locations target
             join public.locations location on location.id = target.location_id
             where target.announcement_id = announcement.id
               and location.organization_id = organization.id
           )
         ))
         or (announcement.target_scope = 'organization' and member.role = 'manager')
         or exists (
           select 1 from public.locations location
           where location.organization_id = organization.id
             and (announcement.target_scope = 'organization' or exists (
               select 1 from public.announcement_locations target
               where target.announcement_id = announcement.id and target.location_id = location.id
             ))
             and (
               exists (
                 select 1 from public.location_memberships membership
                 where membership.location_id = location.id
                   and membership.user_id = member."userId"
                   and membership.role in ('owner', 'admin', 'manager')
               )
               or exists (
                 select 1 from public.employees employee
                 join public.employee_location_assignments assignment on assignment.employee_id = employee.id
                 where employee.organization_id = organization.id
                   and employee.user_id = member."userId" and employee.status = 'active'
                   and assignment.location_id = location.id
                   and assignment.is_enabled = true and assignment.disabled_at is null
               )
             )
         )
       )`,
    [announcementId]
  )

  return recipientSchema.array().parse(result.rows)
}

export { listAnnouncementPushRecipients }

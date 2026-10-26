const accountCollection = [
  {
    title: "Account profile",
    sql: `select id, name, email, "emailVerified", image, "dateOfBirth", "createdAt", "updatedAt" from public."user" where id = $1`,
  },
  {
    title: "Sign-in history still held",
    sql: `select id, "createdAt", "updatedAt", "expiresAt", "ipAddress", "userAgent" from public.session where "userId" = $1`,
  },
  {
    title: "Sign-in methods",
    sql: `select "providerId", "createdAt", "updatedAt" from public.account where "userId" = $1`,
  },
  {
    title: "Passkey device details",
    sql: `select name, "deviceType", "backedUp", transports, "createdAt" from public.passkey where "userId" = $1`,
  },
  {
    title: "Notification preferences",
    sql: `select announcement_push_enabled, updated_at from account_private.user_preferences where user_id = $1`,
  },
  {
    title: "Push device details",
    sql: `select device_description, user_agent, platform, created_at, updated_at, last_used_at, revoked_at from push_private.push_subscriptions where user_id = $1`,
  },
  {
    title: "Onboarding preferences",
    sql: `select intent, created_at, updated_at from public.user_onboarding_preferences where user_id = $1`,
  },
  {
    title: "Workplace memberships",
    sql: `select m."organizationId", o.name as workplace, m.role, m."createdAt" from public.member m join public.organization o on o.id = m."organizationId" where m."userId" = $1`,
  },
  {
    title: "Location memberships",
    sql: `select m.location_id, l.name as location, m.role, m.created_at, m.updated_at from public.location_memberships m join public.locations l on l.id = m.location_id where m.user_id = $1`,
  },
  {
    title: "Invitations addressed to the account",
    sql: `select "organizationId", email, role, status, "expiresAt", "createdAt" from public.invitation where lower(email) = (select lower(email) from public."user" where id = $1)`,
  },
  {
    title: "Join requests",
    sql: `select id, organization_id, location_id, staff_group_id, status, created_at, decided_at from public.staff_join_requests where user_id = $1`,
  },
] as const

export { accountCollection }

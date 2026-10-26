const activityCollection = [
  {
    title: "Privacy request correspondence (requires disclosure review)",
    sql: `select e.kind, e.public_message, e.internal_note, e.created_at from privacy_private.data_request_events e join privacy_private.data_requests r on r.id = e.request_id where r.user_id = $1`,
  },
  {
    title: "Announcements authored by the account",
    sql: `select id, organization_id, title, body, status, published_at, archived_at, created_at, updated_at from public.announcements where author_user_id = $1`,
  },
  {
    title: "Announcement reading records",
    sql: `select announcement_id, read_at from public.announcement_reads where user_id = $1`,
  },
  {
    title: "Poll responses",
    sql: `select v.announcement_id, o.label as selected_option, v.created_at, v.updated_at from public.announcement_poll_votes v join public.announcement_poll_options o on o.id = v.option_id where v.user_id = $1`,
  },
  {
    title: "Rota reading records",
    sql: `select rota_id, seen_published_version, seen_at, created_at, updated_at from public.rota_reads where user_id = $1`,
  },
  {
    title: "Support conversations (requires third-party review)",
    sql: `select t.id as thread_id, t.subject, t.category, t.status, m.author_type, m.body, m.is_internal_note, m.created_at from admin_private.support_threads t join admin_private.support_messages m on m.thread_id = t.id where t.created_by_user_id = $1 or m.user_id = $1`,
  },
  {
    title: "Application activity associated with the account",
    sql: `select event_type, organization_id, location_id, target_type, target_id, created_at from admin_private.app_events where actor_user_id = $1`,
  },
  {
    title: "Error reports associated with the account",
    sql: `select source, severity, status, message, route_path, browser_name, browser_version, operating_system, user_agent, first_seen_at, last_seen_at, occurrence_count from admin_private.app_error_reports where user_id = $1`,
  },
  {
    title: "Account status records",
    sql: `select status, reason, updated_at from admin_private.app_user_status_overrides where user_id = $1`,
  },
  {
    title: "Clock station purchases made by the account",
    sql: `select id, location_id, unit_amount, currency, payment_status, paid_at, fulfillment_status, delivery_name, delivery_line1, delivery_line2, delivery_city, delivery_county, delivery_postcode, delivery_country, shipped_at, delivered_at, created_at from billing_private.clock_station_purchases where created_by_user_id = $1`,
  },
  {
    title: "Privacy request history",
    sql: `select id, status, requested_at, due_at, public_message, released_at, downloaded_at from privacy_private.data_requests where user_id = $1`,
  },
] as const

export { activityCollection }

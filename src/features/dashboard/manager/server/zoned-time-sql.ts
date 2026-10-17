// Match combineDateAndTimeInTimeZone: choose the earlier instant when a local
// clock time occurs twice. PostgreSQL AT TIME ZONE alone chooses the later one.
// The samples discover real offsets, including half-hour and date-line changes.
function dashboardZonedTimeSql(
  localColumn: "local_start" | "local_end"
): string {
  return `coalesce((
    select min(candidate) from (
      select (t.${localColumn} - (
        (sample at time zone t.time_zone) - (sample at time zone 'UTC')
      )) at time zone 'UTC' as candidate
      from unnest(array[-36, -12, 0, 12, 36]) as hours(value)
      cross join lateral (
        select (t.${localColumn} at time zone 'UTC') + make_interval(hours => hours.value) as sample
      ) offset_sample
    ) candidates
    where candidate at time zone t.time_zone = t.${localColumn}
  ), t.${localColumn} at time zone t.time_zone)`
}
export { dashboardZonedTimeSql }

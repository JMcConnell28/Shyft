type LocationNameClient = {
  query: (
    text: string,
    values: Array<string>
  ) => Promise<{ rows: Array<{ exists?: boolean }> }>
}

/** Call inside the location-creation transaction, before inserting the location. */
async function assertLocationNameAvailable(
  client: LocationNameClient,
  organizationId: string,
  name: string
): Promise<void> {
  // Serialize creation within an organisation so simultaneous submissions cannot
  // both pass the availability check. The lock is released with the transaction.
  await client.query("select pg_advisory_xact_lock(hashtextextended($1, 0))", [
    `location-creation:${organizationId}`,
  ])
  const result = await client.query(
    `select exists (
       select 1 from public.locations
       where organization_id = $1 and name = $2
     ) as exists`,
    [organizationId, name.trim()]
  )
  if (result.rows[0]?.exists) {
    throw new Error(
      "A location with this name already exists in your organisation. Choose a different name."
    )
  }
}

export { assertLocationNameAvailable }

export type { LocationNameClient }

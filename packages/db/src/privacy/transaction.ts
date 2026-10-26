import "@tanstack/react-start/server-only"
import { getDatabase } from "../index"
import type { PoolClient } from "pg"

async function withPrivacyTransaction<T>(
  run: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    const result = await run(client)
    await client.query("commit")
    return result
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}
export { withPrivacyTransaction }

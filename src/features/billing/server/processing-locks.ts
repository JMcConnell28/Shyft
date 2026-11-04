import "@tanstack/react-start/server-only"

import { z } from "zod"
import type { PoolClient } from "pg"

import { getDatabase } from "@/lib/db"

type BillingLockScope = "event" | "subscription"
type BillingProcessingLock = {
  release: () => Promise<void>
  assertHeld: () => void
}
const activeLocks: Record<BillingLockScope, number> = {
  event: 0,
  subscription: 0,
}
const acquiredSchema = z.object({ acquired: z.boolean() })

async function acquireBillingProcessingLock(
  scope: BillingLockScope,
  id: string
): Promise<BillingProcessingLock | null> {
  // Reserve pool capacity for the work performed while locks are held. An event
  // can hold one event lock and one subscription lock without starving queries.
  if (activeLocks[scope] >= 2) return null
  activeLocks[scope]++
  let client: PoolClient | undefined
  const key = `stripe:${scope}:${id}`
  try {
    const connection = await getDatabase().connect()
    client = connection
    let failed = false
    const onError = () => {
      failed = true
    }
    connection.on("error", onError)
    // A transaction pins the backend even through Supavisor transaction mode.
    await connection.query("begin")
    const result = await connection.query(
      "select pg_try_advisory_xact_lock(hashtextextended($1, 0)) as acquired",
      [key]
    )
    if (!acquiredSchema.parse(result.rows[0]).acquired) {
      await connection.query("rollback")
      connection.removeListener("error", onError)
      connection.release()
      activeLocks[scope]--
      return null
    }
    let released = false
    const assertHeld = () => {
      if (failed || released)
        throw new Error(
          "The billing processing claim was lost. Retry the operation."
        )
    }
    return {
      assertHeld,
      release: async () => {
        if (released) return
        released = true
        try {
          if (failed) throw new Error("The billing processing claim was lost.")
          await connection.query("commit")
          connection.release()
        } catch (error) {
          // Destroy the socket if unlock fails; never return a locked session.
          connection.release(true)
          throw error
        } finally {
          connection.removeListener("error", onError)
          activeLocks[scope]--
        }
      },
    }
  } catch (error) {
    client?.release(true)
    activeLocks[scope]--
    throw error
  }
}

export { acquireBillingProcessingLock }

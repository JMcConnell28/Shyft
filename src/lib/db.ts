import "@tanstack/react-start/server-only"

import { Pool } from "pg"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

import { getRequiredEnv } from "@/lib/env.server"

const globalForDatabase = globalThis as typeof globalThis & {
  shyftDatabasePool?: Pool
}

function getDatabase() {
  if (!globalForDatabase.shyftDatabasePool) {
    globalForDatabase.shyftDatabasePool = new Pool({
      ...getDatabaseConnectionConfig(getRequiredEnv("DATABASE_URL")),
    })
  }

  return globalForDatabase.shyftDatabasePool
}

export { getDatabase }

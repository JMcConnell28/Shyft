import "@tanstack/react-start/server-only"

import { Pool } from "pg"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

import { getRequiredEnv } from "@/lib/env.server"

const globalForAdminAuthDatabase = globalThis as typeof globalThis & {
  rocketrotaAdminAuthDatabasePool?: Pool
}

function getAdminAuthDatabase() {
  if (!globalForAdminAuthDatabase.rocketrotaAdminAuthDatabasePool) {
    globalForAdminAuthDatabase.rocketrotaAdminAuthDatabasePool = new Pool({
      ...getDatabaseConnectionConfig(getRequiredEnv("DATABASE_URL")),
      options: "-c search_path=admin_private,public",
    })
  }

  return globalForAdminAuthDatabase.rocketrotaAdminAuthDatabasePool
}

export { getAdminAuthDatabase }

import "@tanstack/react-start/server-only"

import { Pool } from "pg"

import { getRequiredEnv } from "@/lib/env.server"

const globalForAdminAuthDatabase = globalThis as typeof globalThis & {
  rocketrotaAdminAuthDatabasePool?: Pool
}

function getAdminAuthDatabase() {
  if (!globalForAdminAuthDatabase.rocketrotaAdminAuthDatabasePool) {
    globalForAdminAuthDatabase.rocketrotaAdminAuthDatabasePool = new Pool({
      connectionString: getRequiredEnv("DATABASE_URL"),
      options: "-c search_path=admin_private,public",
    })
  }

  return globalForAdminAuthDatabase.rocketrotaAdminAuthDatabasePool
}

export { getAdminAuthDatabase }

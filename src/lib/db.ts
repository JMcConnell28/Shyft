import { Pool } from "pg"

import { getRequiredEnv } from "@/lib/env"

const globalForDatabase = globalThis as typeof globalThis & {
  shyftDatabasePool?: Pool
}

function getDatabase() {
  if (!globalForDatabase.shyftDatabasePool) {
    globalForDatabase.shyftDatabasePool = new Pool({
      connectionString: getRequiredEnv("DATABASE_URL"),
    })
  }

  return globalForDatabase.shyftDatabasePool
}

export { getDatabase }

import "@tanstack/react-start/server-only"

import { Pool, type QueryResultRow } from "pg"

const globalForDatabase = globalThis as typeof globalThis & {
  rocketrotaDatabasePool?: Pool
}

function getRequiredServerEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getDatabase() {
  if (!globalForDatabase.rocketrotaDatabasePool) {
    globalForDatabase.rocketrotaDatabasePool = new Pool({
      connectionString: getRequiredServerEnv("DATABASE_URL"),
    })
  }

  return globalForDatabase.rocketrotaDatabasePool
}

async function queryOne<T extends QueryResultRow>(
  sql: string,
  values: ReadonlyArray<unknown> = [],
) {
  const result = await getDatabase().query<T>(sql, [...values])
  return result.rows.at(0) ?? null
}

async function queryMany<T extends QueryResultRow>(
  sql: string,
  values: ReadonlyArray<unknown> = [],
) {
  const result = await getDatabase().query<T>(sql, [...values])
  return result.rows
}

export { getDatabase, queryMany, queryOne }

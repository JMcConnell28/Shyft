import type { PoolConfig } from "pg"

declare function getDatabaseConnectionConfig(
  connectionString: string | undefined
): Pick<PoolConfig, "connectionString" | "ssl">

export { getDatabaseConnectionConfig }

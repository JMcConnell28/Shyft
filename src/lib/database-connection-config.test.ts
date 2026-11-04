import { X509Certificate } from "node:crypto"
import { Client } from "pg"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

const databaseUrl =
  "postgresql://user:secret@aws-1-eu-west-1.pooler.supabase.com/postgres"

describe("verified database TLS", () => {
  it("retains the trusted CA after pg reparses an approved SSL URL", () => {
    const config = getDatabaseConnectionConfig(
      `${databaseUrl}?sslmode=verify-full&application_name=test`
    )
    const client = new Client(config)

    expect(client.ssl).toMatchObject({
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
      ca: expect.stringContaining("-----BEGIN CERTIFICATE-----"),
    })
    expect(config.connectionString).toContain("application_name=test")
    expect(config.connectionString).not.toContain("sslmode")
  })

  it.each([
    "sslmode=disable",
    "sslmode=prefer",
    "sslmode=require",
    "sslmode=verify-ca",
    "sslmode=no-verify",
    "ssl=false",
    "ssl=0",
    "ssl=no-verify",
    "sslrootcert=untrusted.pem",
    "sslcert=client.pem",
    "sslkey=client.key",
    "sslnegotiation=direct",
    "uselibpqcompat=true",
    "sslmode=verify-full&sslmode=disable",
  ])(
    "rejects URL settings that could replace the TLS policy: %s",
    (options) => {
      expect(() =>
        getDatabaseConnectionConfig(`${databaseUrl}?${options}`)
      ).toThrow("cannot override verified TLS")
    }
  )

  it("does not let PGSSLMODE disable verification", () => {
    vi.stubEnv("PGSSLMODE", "no-verify")
    try {
      expect(
        new Client(getDatabaseConnectionConfig(databaseUrl)).ssl
      ).toMatchObject({ rejectUnauthorized: true })
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("uses a valid public Supabase CA and keeps hostname validation enabled", () => {
    const ssl = z
      .object({ ca: z.string(), checkServerIdentity: z.unknown().optional() })
      .parse(new Client(getDatabaseConnectionConfig(databaseUrl)).ssl)
    const ca = new X509Certificate(ssl.ca)
    expect(ca.ca).toBe(true)
    expect(ca.fingerprint256).toBe(
      "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA"
    )
    expect(ssl.checkServerIdentity).toBeUndefined()
  })

  it("requires TLS even for localhost and uses normal trust roots for other hosts", () => {
    expect(
      new Client(getDatabaseConnectionConfig("postgresql://localhost/test")).ssl
    ).toMatchObject({ rejectUnauthorized: true, minVersion: "TLSv1.2" })
    expect(
      new Client(
        getDatabaseConnectionConfig("postgresql://db.example.com/test")
      ).ssl
    ).not.toHaveProperty("ca")
  })

  it.each([
    undefined,
    "",
    "not-a-url",
    "postgresql://user:secret@[invalid",
    "https://user:secret@example.com/db",
  ])(
    "rejects invalid connection input without echoing credentials",
    (value) => {
      expect(() => getDatabaseConnectionConfig(value)).toThrow(
        "DATABASE_URL must be a valid PostgreSQL URL."
      )
    }
  )
})

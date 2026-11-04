import { parseArgs } from "node:util"
import pg from "pg"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

import {
  operatorAccountInput,
  operatorPasswordInput,
} from "./account-input.mjs"
import { provisionAdminAccount, resetAdminMfa } from "./accounts.mjs"

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    operator: { type: "string" },
    "password-stdin": { type: "boolean" },
    "reset-mfa": { type: "boolean" },
    help: { type: "boolean" },
  },
})

if (values.help) {
  console.log(
    "Provision: node --env-file=<server-env> scripts/admin/provision.mjs --email=<verified-email> --name=<name> --role=<role> --operator=<your-name> --password-stdin"
  )
  console.log(
    "Recovery: same command with --email, --operator and --reset-mfa. Verify the operator's identity first. No password is printed or accepted on the command line."
  )
} else {
  let pool
  try {
    const input = operatorAccountInput.parse(values)
    let password
    if (!values["reset-mfa"]) {
      if (!values["password-stdin"] || process.stdin.isTTY)
        throw new Error("Provide a password through protected standard input.")
      const chunks = []
      let bytes = 0
      for await (const chunk of process.stdin) {
        bytes += chunk.length
        if (bytes > 1024) throw new Error("Password input exceeds the limit.")
        chunks.push(chunk)
      }
      password = operatorPasswordInput.parse(
        Buffer.concat(chunks)
          .toString("utf8")
          .replace(/\r?\n$/, "")
      )
    }
    pool = new pg.Pool(getDatabaseConnectionConfig(process.env.DATABASE_URL))
    const client = await pool.connect()
    try {
      if (values["reset-mfa"]) await resetAdminMfa(client, input)
      else if (password) await provisionAdminAccount(client, input, password)
      console.log(
        "Operator action completed and audited. Sign in and complete authenticator enrollment before using private tools."
      )
    } finally {
      client.release()
    }
  } catch {
    console.error(
      "Operator action failed. Check the input, database permissions and migration state. No public signup or recovery fallback is available."
    )
    process.exitCode = 1
  } finally {
    await pool?.end()
  }
}

import { randomUUID } from "node:crypto"
import { hashPassword } from "better-auth/crypto"

/** @typedef {import('zod').infer<typeof import('./account-input.mjs').operatorAccountInput>} OperatorInput */

/** @param {import('pg').PoolClient} client @param {OperatorInput} input @param {string} password */
async function provisionAdminAccount(client, input, password) {
  const passwordHash = await hashPassword(password)
  const userId = randomUUID()
  await client.query("begin")
  try {
    if (!input.name) throw new Error("The operator name is required.")
    await client.query(
      `insert into admin_private.admin_user (id, email, name, "emailVerified", role)
      values ($1, $2, $3, true, $4)`,
      [userId, input.email, input.name, input.role]
    )
    await client.query(
      `insert into admin_private.admin_account
      (id, "accountId", "providerId", "userId", password, "updatedAt")
      values ($1, $2, 'credential', $2, $3, now())`,
      [randomUUID(), userId, passwordHash]
    )
    await auditOperatorAction(client, input, userId, "admin.provisioned")
    await client.query("commit")
    return userId
  } catch (error) {
    await client.query("rollback")
    throw error
  }
}

/** @param {import('pg').PoolClient} client @param {OperatorInput} input */
async function resetAdminMfa(client, input) {
  await client.query("begin")
  try {
    const result = await client.query(
      `select id from admin_private.admin_user
      where lower(email) = $1 and disabled_at is null for update`,
      [input.email]
    )
    const row = result.rows[0]
    if (!row || typeof row.id !== "string")
      throw new Error("An active provisioned operator is required.")
    await client.query(
      `update admin_private.admin_user set "twoFactorEnabled" = false, "updatedAt" = now() where id = $1`,
      [row.id]
    )
    await client.query(
      'delete from admin_private.admin_two_factor where "userId" = $1',
      [row.id]
    )
    await client.query(
      'delete from admin_private.admin_session where "userId" = $1',
      [row.id]
    )
    await client.query(
      "delete from admin_private.admin_verification where value = $1",
      [row.id]
    )
    await auditOperatorAction(client, input, row.id, "admin.mfa_reset")
    await client.query("commit")
    return row.id
  } catch (error) {
    await client.query("rollback")
    throw error
  }
}

/** @param {import('pg').PoolClient} client @param {OperatorInput} input @param {string} userId @param {string} action */
async function auditOperatorAction(client, input, userId, action) {
  await client.query(
    `insert into admin_private.admin_audit_logs (action, target_type, target_id, metadata)
    values ($1, 'admin_user', $2, $3::jsonb)`,
    [
      action,
      userId,
      JSON.stringify({
        source: "operator-cli",
        operator: input.operator,
        role: input.role,
      }),
    ]
  )
}

export { provisionAdminAccount, resetAdminMfa }

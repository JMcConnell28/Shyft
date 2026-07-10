import { authClient } from "@/lib/auth-client"

const passkeyQueryKey = ["account", "passkeys"] as const

async function listPasskeys() {
  const result = await authClient.passkey.listUserPasskeys()

  if (result.error) throw new Error(result.error.message)
  return result.data ?? []
}

export { listPasskeys, passkeyQueryKey }

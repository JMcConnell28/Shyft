import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"

const authClient = createAuthClient({ plugins: [twoFactorClient()] })

export { authClient }

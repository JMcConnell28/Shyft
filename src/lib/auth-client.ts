import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { stripeClient } from "@better-auth/stripe/client"

import { ac, roles } from "@/lib/auth/permissions"

const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac, roles }),
    passkeyClient(),
    stripeClient({
      subscription: true,
    }),
  ],
})

export { authClient }

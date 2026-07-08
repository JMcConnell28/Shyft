import { createAuthClient } from "better-auth/react"
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { stripeClient } from "@better-auth/stripe/client"

import { ac, roles } from "@/lib/auth/permissions"
import { authUserAdditionalFields } from "@/lib/auth-fields"

const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: authUserAdditionalFields,
    }),
    organizationClient({ ac, roles }),
    passkeyClient(),
    stripeClient({
      subscription: true,
    }),
  ],
})

export { authClient }

import { createServerFn } from "@tanstack/react-start"

const prepareDemoAccount = createServerFn({ method: "POST" }).handler(
  async () => {
    const module = await import("@/features/demo/server/demo-account")
    return module.prepareDemoAccount()
  },
)

export { prepareDemoAccount }

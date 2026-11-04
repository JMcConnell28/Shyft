import { createServerFn } from "@tanstack/react-start"

import { getAppBaseUrl } from "@/lib/app-url.server"

const stagingOrigin = "https://dev.rocketrota.com"

const getDemoAvailability = createServerFn({ method: "GET" }).handler(() => {
  return (
    import.meta.env.DEV || URL.parse(getAppBaseUrl())?.origin === stagingOrigin
  )
})

export { getDemoAvailability }

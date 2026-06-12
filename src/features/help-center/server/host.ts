import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

const getHelpHostState = createServerFn({ method: "GET" }).handler(() => {
  const host = getRequestHeaders().get("host") ?? ""

  return {
    isHelpHost: host.toLowerCase().startsWith("help."),
  }
})

export { getHelpHostState }

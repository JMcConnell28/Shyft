import * as React from "react"

function useViewerTimeZone() {
  const [timeZone, setTimeZone] = React.useState<string | null>(null)

  React.useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  return timeZone
}

export { useViewerTimeZone }

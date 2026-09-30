import * as React from "react"

function useTouchInput(): boolean {
  const [isTouchInput, setIsTouchInput] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)")
    const updateMatch = () => setIsTouchInput(mediaQuery.matches)

    updateMatch()
    mediaQuery.addEventListener("change", updateMatch)

    return () => mediaQuery.removeEventListener("change", updateMatch)
  }, [])

  return isTouchInput
}

export { useTouchInput }

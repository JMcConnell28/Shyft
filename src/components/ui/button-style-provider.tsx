import * as React from "react"

type ButtonAppearance = "default" | "workspace"

const ButtonStyleContext = React.createContext<ButtonAppearance>("default")

function ButtonStyleProvider({
  appearance,
  children,
}: {
  appearance: ButtonAppearance
  children: React.ReactNode
}) {
  return <ButtonStyleContext value={appearance}>{children}</ButtonStyleContext>
}

function useButtonAppearance(appearance?: ButtonAppearance): ButtonAppearance {
  const inherited = React.useContext(ButtonStyleContext)
  return appearance ?? inherited
}

export { ButtonStyleProvider, useButtonAppearance }
export type { ButtonAppearance }

import type { ReactNode } from "react"

import { BrandedArtworkShell } from "@/components/app/branded-artwork-shell"
import { SignOutButton } from "@/components/app/sign-out-button"

function SetupArtworkShell({ children }: { children: ReactNode }) {
  return (
    <BrandedArtworkShell headerAction={<SignOutButton />}>
      {children}
    </BrandedArtworkShell>
  )
}

export { SetupArtworkShell }

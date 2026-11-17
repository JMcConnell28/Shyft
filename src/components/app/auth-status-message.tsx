import type { ReactNode } from "react"

function AuthStatusMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-[#dfe4ef] bg-[#f8faff] px-3.5 py-3 text-xs leading-5 font-medium text-[#657398]"
    >
      {children}
    </div>
  )
}

export { AuthStatusMessage }

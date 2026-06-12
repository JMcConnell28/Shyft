const devEmailOptions = [
  {
    value: "verify-email",
    label: "Verify email",
  },
  {
    value: "reset-password",
    label: "Reset password",
  },
  {
    value: "organization-invitation",
    label: "Organization invitation",
  },
  {
    value: "workspace-welcome",
    label: "Workspace welcome",
  },
  {
    value: "rota-published",
    label: "Rota published",
  },
  {
    value: "trial-ending",
    label: "Trial ending",
  },
  {
    value: "payment-failed",
    label: "Payment failed",
  },
] as const

type DevEmailType = (typeof devEmailOptions)[number]["value"]

export { devEmailOptions }
export type { DevEmailType }

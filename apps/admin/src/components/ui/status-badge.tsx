import { Badge } from "@panelui/badge"

const variants = {
  neutral: "secondary",
  good: "success",
  warning: "warning",
  danger: "destructive",
} as const

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "good" | "warning" | "danger"
}) {
  return <Badge variant={variants[tone]}>{children}</Badge>
}

export { StatusBadge }

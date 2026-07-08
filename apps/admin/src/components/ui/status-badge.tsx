import { cn } from "@/lib/utils"

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "good" | "warning" | "danger"
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        tone === "neutral" && "bg-slate-100 text-slate-700",
        tone === "good" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-red-50 text-red-700",
      )}
    >
      {children}
    </span>
  )
}

export { StatusBadge }

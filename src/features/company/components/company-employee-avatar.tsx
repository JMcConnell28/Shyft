import { cn } from "@/lib/utils"

function CompanyEmployeeAvatar({
  name,
  size = "small",
}: {
  name: string
  size?: "small" | "large"
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] font-bold text-[#0968f5]",
        size === "large" ? "size-14 text-lg" : "size-10 text-sm"
      )}
    >
      {initials}
    </span>
  )
}

export { CompanyEmployeeAvatar }

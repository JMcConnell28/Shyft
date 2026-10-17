import { cn } from "@/lib/utils"

function TimeEntryNotes({
  notes,
  requiresReview,
}: {
  notes: string | null
  requiresReview: boolean
}) {
  const details = notes?.trim()

  if (!details && !requiresReview) return null

  return (
    <div
      className={cn(
        "mt-2 rounded-lg px-3 py-2 text-xs",
        requiresReview
          ? "bg-orange-50 text-orange-800"
          : "bg-[#f0f3f8] text-[#46577d]"
      )}
    >
      <p className="font-semibold">
        {requiresReview ? "Reason for review" : "Entry notes"}
      </p>
      <p className="mt-1 wrap-anywhere whitespace-pre-wrap">
        {details || "No reason was recorded for this entry."}
      </p>
    </div>
  )
}

export { TimeEntryNotes }

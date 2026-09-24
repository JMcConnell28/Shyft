import { PlusIcon } from "lucide-react"

import type { AnnouncementFilter } from "@/features/announcements/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const filters: Array<{ label: string; value: AnnouncementFilter }> = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Pinned", value: "pinned" },
]

function AnnouncementsToolbar({
  canCreate,
  filter,
  isMarkingAllRead,
  unreadCount,
  workspaceName,
  onCreate,
  onFilterChange,
  onMarkAllRead,
}: {
  canCreate: boolean
  filter: AnnouncementFilter
  isMarkingAllRead: boolean
  unreadCount: number
  workspaceName: string
  onCreate: () => void
  onFilterChange: (filter: AnnouncementFilter) => void
  onMarkAllRead: () => void
}) {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-none font-extrabold tracking-[-0.045em] text-[#0d204f] sm:text-3xl">
            Announcements
          </h1>
          <p className="mt-2 text-sm font-medium text-[#61709a]">
            Updates for {workspaceName}.
          </p>
        </div>
        {canCreate ? (
          <Button
            type="button"
            className="h-10 w-full rounded-lg bg-[#0867f2] px-4 text-sm font-semibold text-white hover:bg-[#075edc] sm:w-auto"
            onClick={onCreate}
          >
            <PlusIcon className="size-4" />
            New announcement
          </Button>
        ) : null}
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filter announcements"
          className="inline-flex w-full rounded-lg border border-[#dfe5f0] bg-white p-1 sm:w-auto"
        >
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => onFilterChange(item.value)}
              className={cn(
                "min-h-9 flex-1 rounded-md px-3 text-xs font-semibold transition-colors sm:flex-none sm:px-4",
                filter === item.value
                  ? "bg-[#eef3ff] text-[#0968f5]"
                  : "text-[#61709a] hover:bg-[#f6f8fc] hover:text-[#10204b]"
              )}
            >
              {item.label}
              {item.value === "unread" && unreadCount > 0
                ? ` (${unreadCount})`
                : ""}
            </button>
          ))}
        </div>

        {unreadCount > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 self-end px-2 text-xs font-semibold text-[#0968f5] hover:bg-[#eef3ff] hover:text-[#075edc] sm:self-auto"
            disabled={isMarkingAllRead}
            onClick={onMarkAllRead}
          >
            Mark all read
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export { AnnouncementsToolbar }

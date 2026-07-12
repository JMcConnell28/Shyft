import { CheckIcon } from "lucide-react"

import type { AnnouncementPoll as AnnouncementPollData } from "@/features/announcements/types"
import { cn } from "@/lib/utils"

type AnnouncementPollProps = {
  announcementId: string
  disabled?: boolean
  isVoting: boolean
  poll: AnnouncementPollData
  onVote: (input: { announcementId: string; optionId: string }) => void
}

function AnnouncementPoll({
  announcementId,
  disabled = false,
  isVoting,
  poll,
  onVote,
}: AnnouncementPollProps) {
  const hasVoted = Boolean(poll.selectedOptionId)

  return (
    <fieldset className="mt-3 grid gap-2">
      <legend className="sr-only">Announcement poll</legend>
      {poll.options.map((option) => {
        const isSelected = poll.selectedOptionId === option.id
        const percentage =
          poll.totalVotes === 0
            ? 0
            : Math.round((option.voteCount / poll.totalVotes) * 100)

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled || isVoting}
            aria-pressed={isSelected}
            onClick={() => onVote({ announcementId, optionId: option.id })}
            className={cn(
              "relative isolate flex min-h-10 items-center justify-between overflow-hidden rounded-[10px] border px-3 text-left text-xs font-semibold transition-colors",
              isSelected
                ? "border-[#0868f7] text-[#075dcc]"
                : "border-[#dce4f0] text-[#263b66] hover:border-[#b8c7dc]"
            )}
          >
            {hasVoted ? (
              <span
                className={cn(
                  "absolute inset-y-0 left-0 -z-10 bg-[#edf4ff] transition-[width] duration-300",
                  isSelected && "bg-[#e2edff]"
                )}
                style={{ width: `${percentage}%` }}
              />
            ) : null}
            <span className="flex min-w-0 items-center gap-2">
              {isSelected ? <CheckIcon className="size-3.5 shrink-0" /> : null}
              <span className="truncate">{option.label}</span>
            </span>
            {hasVoted ? <span className="ml-3">{percentage}%</span> : null}
          </button>
        )
      })}
      <p className="text-[11px] font-medium text-[#71809d]">
        {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
        {hasVoted && !disabled
          ? " · Tap another option to change your vote"
          : ""}
      </p>
    </fieldset>
  )
}

export { AnnouncementPoll }

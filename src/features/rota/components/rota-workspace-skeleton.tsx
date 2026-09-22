import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function RotaWorkspaceSkeleton({
  publishedOnly = false,
}: {
  publishedOnly?: boolean
}) {
  return (
    <div
      role="status"
      aria-label="Loading rota"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <span className="sr-only">
        {publishedOnly ? "Loading published rota…" : "Loading rota board…"}
      </span>
      <div
        aria-hidden="true"
        className="flex min-h-0 flex-1 animate-pulse flex-col gap-2 overflow-hidden bg-[#f7f8fb] p-2.5 motion-reduce:animate-none md:p-2"
      >
        <div
          className={cn(
            "flex shrink-0 flex-col gap-2 px-2 md:flex-row md:items-center md:justify-between",
            publishedOnly ? "min-h-14" : "md:h-10"
          )}
        >
          <div className="flex flex-col gap-2 py-2 md:w-64">
            <Placeholder className="h-4 w-32" />
            <Placeholder className="h-3 w-44" />
          </div>
          <div className="flex items-center gap-2 py-1">
            <Placeholder className="h-8 w-24 rounded-lg" />
            <Placeholder className="h-8 w-16 rounded-lg" />
            {!publishedOnly && (
              <Placeholder className="h-8 w-20 rounded-lg bg-primary/10" />
            )}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
          {!publishedOnly && <StaffPanelSkeleton />}
          <div
            className={cn(
              "grid min-h-0 min-w-0 flex-1 grid-flow-col gap-2.5 overflow-hidden md:auto-cols-auto md:grid-flow-row md:grid-cols-7 md:gap-2",
              publishedOnly
                ? "auto-cols-[calc(50%-0.3125rem)]"
                : "auto-cols-[100%]"
            )}
          >
            {Array.from({ length: 7 }, (_, day) => (
              <DaySkeleton key={day} day={day} />
            ))}
          </div>
        </div>
        {!publishedOnly && (
          <div className="hidden h-10 shrink-0 items-center justify-end gap-6 px-3 md:flex">
            <Placeholder className="h-3 w-20" />
            <Placeholder className="h-3 w-24" />
            <Placeholder className="h-3 w-20" />
          </div>
        )}
      </div>
    </div>
  )
}

function Placeholder({ className }: { className: string }) {
  return <Skeleton className={cn("animate-none bg-[#e7ebf3]", className)} />
}

function StaffPanelSkeleton() {
  return (
    <div className="flex w-1/2 shrink-0 flex-col gap-4 overflow-hidden rounded-xl border border-[#e7eaf2] bg-white p-2 md:w-64 md:border-0 md:bg-transparent">
      <Placeholder className="h-9 w-full rounded-lg" />
      {[0, 1].map((group) => (
        <div key={group} className="space-y-3">
          <Placeholder className="h-3 w-20" />
          <div className="grid gap-2 lg:grid-cols-2">
            {[0, 1, 2, 3].map((employee) => (
              <div
                key={employee}
                className="flex items-center gap-2 rounded-lg border border-[#e7eaf2] bg-white p-2"
              >
                <Placeholder className="size-6 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Placeholder className="h-2.5 w-full" />
                  <Placeholder className="h-2 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DaySkeleton({ day }: { day: number }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-[#dfe5f0] bg-[#f8faff] md:rounded-lg">
      <div className="flex h-16 shrink-0 flex-col items-center justify-center gap-2 border-b border-[#edf0f6]">
        <Placeholder className="h-3 w-8" />
        <Placeholder className="h-5 w-6" />
      </div>
      <div className="space-y-2 overflow-hidden px-1 py-2">
        {Array.from({ length: (day % 3) + 2 }, (_, shift) => (
          <div
            key={shift}
            className="space-y-3 rounded-lg border border-[#e7eaf2] bg-white p-2.5"
          >
            <Placeholder className="h-2.5 w-3/4" />
            <Placeholder className="h-2 w-1/2" />
            <Placeholder className="h-7 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PublishedRotaSkeleton() {
  return <RotaWorkspaceSkeleton publishedOnly />
}

export { PublishedRotaSkeleton, RotaWorkspaceSkeleton }

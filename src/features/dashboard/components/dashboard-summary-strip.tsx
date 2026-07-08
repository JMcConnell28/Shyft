import type { DashboardShiftOverview } from "@/features/dashboard/types"

function DashboardSummaryStrip({
  overview,
}: {
  overview: DashboardShiftOverview
}) {
  return (
    <section className="rounded-[14px] border border-[#dfe5f0] bg-card px-5 py-4 shadow-[0_8px_24px_rgba(30,50,96,0.045)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.08em] text-[#7a86a4] uppercase">
            Dashboard
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#11245a]">
            Your shift overview
          </h2>
          <p className="mt-1 text-sm font-medium text-[#7a86a4]">
            Time clock status, announcements, and published shifts for{" "}
            {overview.weekRangeLabel}.
          </p>
        </div>
        <div className="grid w-full shrink-0 grid-cols-3 overflow-hidden rounded-[12px] border border-[#e4e8f0] bg-[#fbfcff] lg:w-auto">
          <SummaryMetric
            label="This week"
            value={`${overview.thisWeekShifts.length}`}
          />
          <SummaryMetric
            label="Next shift"
            value={overview.nextShift?.dayLabel ?? "None"}
          />
          <SummaryMetric
            label="Clock"
            value={overview.clockStatus.openEntry ? "In" : "Out"}
          />
        </div>
      </div>
    </section>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 border-r border-[#e4e8f0] px-4 py-3 last:border-r-0">
      <p className="text-[11px] font-semibold text-[#7a86a4]">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#11245a]">
        {value}
      </p>
    </div>
  )
}

export { DashboardSummaryStrip }

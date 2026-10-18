import { ShiftOverviewCards } from "./shift-overview-cards"
import type { ComponentProps } from "react"
import type { ShiftOverviewInput } from "@/features/dashboard/types"
import { useShiftOverviewQuery } from "@/features/dashboard/hooks/use-shift-overview-query"

function PersonalDashboard({
  input,
  ...props
}: ComponentProps<typeof ShiftOverviewCards> & { input: ShiftOverviewInput }) {
  const query = useShiftOverviewQuery(input, props.overview)
  return (
    <>
      {query.isError ? (
        <p role="alert" className="px-4 py-2 text-sm">
          Could not refresh your clock status. Showing the last recorded status.
        </p>
      ) : null}
      <ShiftOverviewCards {...props} overview={query.data} />
    </>
  )
}

export { PersonalDashboard }

import { useEffect, useRef, useState } from "react"
import { useSearch } from "@tanstack/react-router"
import type {
  ManagerTimesheet,
  TimesheetEntry,
} from "@/features/timesheets/types"
import { timesheetSearchSchema } from "@/features/timesheets/schemas/timesheet-search-schema"
import { findEditableTimesheetEntry } from "@/features/timesheets/utils/find-editable-timesheet-entry"

function useTimesheetEntrySelection(
  timesheet: ManagerTimesheet,
  writableLocationIds: Array<string>
) {
  const entryId = useSearch({
    strict: false,
    select: (search) => timesheetSearchSchema.parse(search).entryId,
  })
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(
    null
  )
  const openedEntry = useRef<string | undefined>(undefined)
  const requestedEntry = findEditableTimesheetEntry(
    timesheet,
    entryId,
    writableLocationIds
  )
  useEffect(() => {
    if (entryId && entryId !== openedEntry.current && requestedEntry) {
      openedEntry.current = entryId
      setSelectedEntry(requestedEntry)
    }
  }, [entryId, requestedEntry])
  return {
    selectedEntry,
    setSelectedEntry,
    unavailable: Boolean(entryId && !requestedEntry),
  }
}
export { useTimesheetEntrySelection }

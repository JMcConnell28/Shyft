import * as React from "react"
import { useDroppable } from "@dnd-kit/core"

import DraggableEmployeeCard from "./draggable-employee-card"
import EmployeeSearch from "./employee-search"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ROTA_EMPLOYEE_LIST_DROP_ID } from "@/features/rota/constants/drag-and-drop"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { cn } from "@/lib/utils"

function EmployeeList({ className }: { className?: string }) {
  const {
    employeeGroups,
    employeeMetricsById,
    employeesById,
    formatMinutesAsHours,
  } = useRotaWorkspace()
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [showTopFade, setShowTopFade] = React.useState(false)
  const [showBottomFade, setShowBottomFade] = React.useState(false)
  const { setNodeRef } = useDroppable({
    id: ROTA_EMPLOYEE_LIST_DROP_ID,
    data: {
      type: "employee-list",
    },
  })

  React.useEffect(() => {
    const container = scrollContainerRef.current

    if (!container) {
      return
    }

    function updateFades() {
      const scrollNode = scrollContainerRef.current

      if (!scrollNode) {
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollNode
      const maxScrollTop = Math.max(scrollHeight - clientHeight, 0)

      setShowTopFade(scrollTop > 2)
      setShowBottomFade(scrollTop < maxScrollTop - 2)
    }

    updateFades()
    container.addEventListener("scroll", updateFades, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      updateFades()
    })

    resizeObserver.observe(container)

    for (const child of Array.from(container.children)) {
      resizeObserver.observe(child)
    }

    window.addEventListener("resize", updateFades)

    return () => {
      container.removeEventListener("scroll", updateFades)
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateFades)
    }
  }, [employeeGroups])

  return (
    <aside
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col gap-1.5 overflow-hidden rounded-xl border bg-white p-2 shadow-[0_6px_18px_rgba(30,50,96,0.05)] ring-[#e7eaf2] sm:border-0 sm:ring-0 md:bg-transparent md:p-0 md:shadow-none xl:w-64",
        className
      )}
    >
      <EmployeeSearch />
      <div className="relative min-h-0 flex-1 rounded-lg">
        {showTopFade ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-linear-to-b from-white to-transparent md:from-background" />
        ) : null}
        {showBottomFade ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-linear-to-t from-white via-white/85 to-transparent md:from-background md:via-background/85" />
        ) : null}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar h-full overflow-y-auto pr-1"
        >
          <Accordion
            className="overflow-visible md:overflow-hidden md:rounded-lg md:bg-card"
            defaultValue={employeeGroups.map((group) => group.id)}
            multiple
          >
            {employeeGroups.map((group) => (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="md:data-open:bg-card"
              >
                <AccordionTrigger>
                  <span>{group.name}</span>
                </AccordionTrigger>
                <AccordionContent className="grid grid-cols-1 gap-1 pt-1 md:bg-card lg:grid-cols-2">
                  {group.employeeIds.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[#dfe5f0] px-2.5 py-2 text-[11px] font-medium text-[#7a86a4] lg:col-span-2">
                      No employees assigned to {group.name}.
                    </p>
                  ) : (
                    group.employeeIds.map((employeeId) => {
                      const employee = employeesById[employeeId]

                      const metrics = employeeMetricsById[employee.id] ?? {
                        scheduledMinutes: 0,
                        shiftCount: 0,
                        weeklyContractMinutes: employee.weeklyHours * 60,
                        utilizationPercent: 0,
                        scheduleStatus: "under" as const,
                        warningCount: 0,
                        availabilityConflictCount: 0,
                        overlapConflictCount: 0,
                      }

                      return (
                        <DraggableEmployeeCard
                          key={employee.id}
                          employee={employee}
                          hoursLabel={formatMinutesAsHours(
                            metrics.scheduledMinutes
                          )}
                          contractHoursLabel={formatMinutesAsHours(
                            metrics.weeklyContractMinutes
                          )}
                          hoursProgress={metrics.utilizationPercent}
                          scheduleStatus={metrics.scheduleStatus}
                          shiftCount={metrics.shiftCount}
                          dragId={`employee-${employee.id}`}
                          dragData={{
                            type: "employee",
                            employeeId: employee.id,
                          }}
                          layout="compact"
                        />
                      )
                    })
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </aside>
  )
}

export default EmployeeList

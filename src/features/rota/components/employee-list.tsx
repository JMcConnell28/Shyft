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

function EmployeeList() {
  const {
    employeeGroups,
    employeeMetricsById,
    employeesById,
    formatMinutesAsHours,
  } = useRotaWorkspace()
  const { setNodeRef } = useDroppable({
    id: ROTA_EMPLOYEE_LIST_DROP_ID,
    data: {
      type: "employee-list",
    },
  })

  return (
    <aside ref={setNodeRef} className="flex h-full min-h-0 w-64 shrink-0 flex-col gap-2 overflow-hidden rounded-lg xl:w-72">
      <EmployeeSearch />
      <Accordion
        className="min-h-0 flex-1 overflow-hidden"
        defaultValue={employeeGroups.map((group) => group.id)}
        multiple
      >
        {employeeGroups.map((group) => (
          <AccordionItem key={group.id} value={group.id}>
            <AccordionTrigger>
              <span>{group.name}</span>
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 gap-1 pt-1 md:grid-cols-2">
              {group.employeeIds.map((employeeId) => {
                const employee = employeesById[employeeId]

                if (!employee) {
                  return null
                }

                const metrics = employeeMetricsById[employee.id] ?? {
                  scheduledMinutes: 0,
                  shiftCount: 0,
                }

                return (
                  <DraggableEmployeeCard
                    key={employee.id}
                    employee={employee}
                    hoursLabel={formatMinutesAsHours(metrics.scheduledMinutes)}
                    shiftCount={metrics.shiftCount}
                    dragId={`employee-${employee.id}`}
                    dragData={{
                      type: "employee",
                      employeeId: employee.id,
                    }}
                    layout="compact"
                  />
                )
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </aside>
  )
}

export default EmployeeList

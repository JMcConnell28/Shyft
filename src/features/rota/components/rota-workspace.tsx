"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { toast } from "react-hot-toast"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  useDndContext,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import EmployeeCard from "./employee-card"
import EmployeeList from "./employee-list"
import RotaNavigationBlocker from "./rota-navigation-blocker"
import ToolBar from "./tool-bar"
import WeekContainer from "./week-container"
import WeekSummary from "./week-summary"
import { ROTA_EMPLOYEE_LIST_DROP_ID } from "@/features/rota/constants/drag-and-drop"
import {
  RotaWorkspaceProvider,
  useRotaWorkspace,
} from "@/features/rota/components/rota-workspace-provider"
import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import type { WorkspaceDragData } from "@/features/rota/types/workspace"

function RotaWorkspace({
  boardData,
  mode = "default",
}: {
  boardData: WorkspaceBoardData
  mode?: "default" | "demo"
}) {
  return (
    <RotaWorkspaceProvider boardData={boardData} mode={mode}>
      <RotaWorkspaceCanvas mode={mode} />
    </RotaWorkspaceProvider>
  )
}

function RotaWorkspaceCanvas({ mode }: { mode: "default" | "demo" }) {
  const {
    assignEmployeeToShift,
    employeeMetricsById,
    employeesById,
    formatMinutesAsHours,
    moveAssignmentToShift,
    removeAssignment,
  } = useRotaWorkspace()
  const [activeDragData, setActiveDragData] =
    React.useState<WorkspaceDragData | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 1,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveDragData(getWorkspaceDragData(event.active.data.current))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const dragData = getWorkspaceDragData(event.active.data.current)
    const overData = event.over?.data.current
    const shiftId =
      typeof overData === "object" &&
      overData !== null &&
      "shiftId" in overData &&
      typeof overData.shiftId === "string"
        ? overData.shiftId
        : null
    const isEmployeeListTarget =
      event.over?.id === ROTA_EMPLOYEE_LIST_DROP_ID ||
      (typeof overData === "object" &&
        overData !== null &&
        "type" in overData &&
        overData.type === "employee-list")

    setActiveDragData(null)

    if (!dragData) {
      return
    }

    if (dragData.type === "employee") {
      if (!shiftId) {
        return
      }

      const result = await assignEmployeeToShift(dragData.employeeId, shiftId)

      if (result.status === "overlap") {
        toast.error(
          `${result.employeeName} is already assigned to ${result.dayLabel} ${result.zoneName}.`
        )
      }

      return
    }

    if (dragData.type === "assignment" && isEmployeeListTarget) {
      await removeAssignment(dragData.assignmentId)
      return
    }

    if (dragData.type === "assignment" && shiftId) {
      const result = await moveAssignmentToShift(dragData.assignmentId, shiftId)

      if (result.status === "overlap") {
        toast.error(
          `${result.employeeName} is already assigned to ${result.dayLabel} ${result.zoneName}.`
        )
      }
    }
  }

  const overlayEmployee =
    activeDragData?.type === "employee"
      ? employeesById[activeDragData.employeeId]
      : activeDragData?.type === "assignment"
        ? employeesById[activeDragData.employeeId]
        : null

  const overlayMetrics = overlayEmployee
    ? (employeeMetricsById[overlayEmployee.id] ?? {
        scheduledMinutes: 0,
        shiftCount: 0,
      })
    : null
  const overlayIsDraggable = Boolean(activeDragData)

  return (
    <DndContext
      collisionDetection={pointerWithin}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragCancel={() => {
        setActiveDragData(null)
      }}
      onDragEnd={handleDragEnd}
    >
      {mode === "default" ? <RotaNavigationBlocker /> : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
        <ToolBar mode={mode} />
        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
          <EmployeeList className="w-1/2 md:w-64" />
          <WeekContainer className="w-1/2 md:w-auto" />
        </div>
        {mode === "default" ? (
          <div className="hidden md:block">
            <WeekSummary />
          </div>
        ) : null}
      </div>

      <ActiveEmployeeDragOverlay
        employee={overlayEmployee}
        hoursLabel={
          overlayMetrics
            ? formatMinutesAsHours(overlayMetrics.scheduledMinutes)
            : null
        }
        shiftCount={overlayMetrics?.shiftCount ?? null}
        isDraggable={overlayIsDraggable}
      />
    </DndContext>
  )
}

function ActiveEmployeeDragOverlay({
  employee,
  hoursLabel,
  shiftCount,
  isDraggable,
}: {
  employee: ReturnType<typeof useRotaWorkspace>["employeesById"][string] | null
  hoursLabel: string | null
  shiftCount: number | null
  isDraggable: boolean
}) {
  const { active, over } = useDndContext()
  const isRemovingAssignment =
    typeof active?.data.current === "object" &&
    active.data.current !== null &&
    "type" in active.data.current &&
    active.data.current.type === "assignment" &&
    over?.id === ROTA_EMPLOYEE_LIST_DROP_ID
  const overlay = (
    <DragOverlay adjustScale={false} dropAnimation={null} zIndex={1000}>
      {employee && hoursLabel !== null && shiftCount !== null ? (
        <EmployeeCard
          employee={employee}
          hoursLabel={hoursLabel}
          shiftCount={shiftCount}
          intent={isRemovingAssignment ? "remove" : "default"}
          layout="compact"
          variant="overlay"
          isDraggable={isDraggable}
        />
      ) : null}
    </DragOverlay>
  )

  if (typeof document === "undefined") {
    return overlay
  }

  return createPortal(overlay, document.body)
}

function getWorkspaceDragData(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "employee" &&
    "employeeId" in data &&
    typeof data.employeeId === "string"
  ) {
    return {
      type: "employee",
      employeeId: data.employeeId,
    } satisfies WorkspaceDragData
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "assignment" &&
    "assignmentId" in data &&
    typeof data.assignmentId === "string" &&
    "employeeId" in data &&
    typeof data.employeeId === "string"
  ) {
    return {
      type: "assignment",
      assignmentId: data.assignmentId,
      employeeId: data.employeeId,
    } satisfies WorkspaceDragData
  }

  return null
}

export default RotaWorkspace

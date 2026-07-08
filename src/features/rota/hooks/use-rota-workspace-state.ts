"use client"

import * as React from "react"

import type {
  CreateWorkspaceShiftInput,
  WorkspaceAssignment,
  WorkspaceAssignmentMutationResult,
  WorkspaceBoardData,
  WorkspaceEmployee,
  WorkspaceShift,
  WorkspaceZone,
} from "@/features/rota/types/workspace"
import { formatMinutesAsHours } from "@/features/rota/utils/workspace-time"
import {
  formatCurrency,
  getScheduledCostSummaries,
  getScheduledShiftCostSummaries,
  getScheduledZoneCostSummaries,
} from "@/features/rota/utils/workspace-budget"
import { buildBudgetInsights } from "@/features/rota/utils/budget-insights"
import {
  compareShiftsByTime,
  getShiftAbsoluteSegments,
  shiftsHaveMatchingTimes,
} from "@/features/rota/utils/workspace-shifts"
import {
  buildWorkspaceInsights,
  getZoneAppearance,
} from "@/features/rota/utils/workspace-insights"

function useRotaWorkspaceState({
  boardData,
  mode = "default",
}: {
  boardData: WorkspaceBoardData
  mode?: "default" | "demo"
}) {
  const [meta, setMeta] = React.useState(boardData.meta)
  const [selectedZoneId, setSelectedZoneId] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [shiftsById, setShiftsById] = React.useState(() =>
    mapById(boardData.shifts)
  )
  const [assignmentsById, setAssignmentsById] = React.useState(() =>
    mapById(boardData.assignments)
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

  React.useEffect(() => {
    setMeta(boardData.meta)
    setShiftsById(mapById(boardData.shifts))
    setAssignmentsById(mapById(boardData.assignments))
    setHasUnsavedChanges(false)
  }, [boardData])

  const employeesById = React.useMemo(
    () => mapById(boardData.employees),
    [boardData.employees]
  )
  const lowerSearchQuery = searchQuery.trim().toLowerCase()

  const visibleShiftIdsByDayId = React.useMemo(() => {
    return boardData.days.reduce<Record<string, string[]>>((map, day) => {
      map[day.id] = Object.values(shiftsById)
        .filter((shift) => shift.dayId === day.id)
        .filter(
          (shift) => selectedZoneId === "all" || shift.zoneId === selectedZoneId
        )
        .sort((left, right) =>
          compareShiftsByTime(left, right, boardData.location)
        )
        .map((shift) => shift.id)

      return map
    }, {})
  }, [boardData.days, boardData.location, selectedZoneId, shiftsById])

  const allShiftIdsByDayId = React.useMemo(() => {
    return boardData.days.reduce<Record<string, string[]>>((map, day) => {
      map[day.id] = Object.values(shiftsById)
        .filter((shift) => shift.dayId === day.id)
        .map((shift) => shift.id)
      return map
    }, {})
  }, [boardData.days, shiftsById])

  const assignmentIdsByShiftId = React.useMemo(() => {
    return Object.values(assignmentsById).reduce<Record<string, string[]>>(
      (map, assignment) => {
        const list = map[assignment.shiftId] ?? []
        list.push(assignment.id)
        map[assignment.shiftId] = list
        return map
      },
      {}
    )
  }, [assignmentsById])

  const workspaceInsights = React.useMemo(
    () =>
      buildWorkspaceInsights({
        assignmentsById,
        days: boardData.days,
        employeesById,
        location: boardData.location,
        shiftsById,
      }),
    [
      assignmentsById,
      boardData.days,
      boardData.location,
      employeesById,
      shiftsById,
    ]
  )

  const employeeGroups = React.useMemo(() => {
    return boardData.employeeGroups
      .map((group) => {
        const employeeIds = boardData.employees
          .filter((employee) => employee.groupId === group.id)
          .filter((employee) => {
            if (!lowerSearchQuery) {
              return true
            }

            return employee.name.toLowerCase().includes(lowerSearchQuery)
          })
          .map((employee) => employee.id)

        return {
          ...group,
          employeeIds,
        }
      })
      .filter((group) => group.employeeIds.length > 0 || !lowerSearchQuery)
  }, [boardData.employeeGroups, boardData.employees, lowerSearchQuery])

  const daySummaries = React.useMemo(() => {
    return getScheduledCostSummaries({
      allShiftIdsByDayId,
      assignmentIdsByShiftId,
      assignmentsById,
      days: boardData.days,
      employeesById,
      location: boardData.location,
      shiftIdsByDayId: visibleShiftIdsByDayId,
      shiftsById,
    })
  }, [
    assignmentIdsByShiftId,
    assignmentsById,
    allShiftIdsByDayId,
    boardData.days,
    boardData.location,
    employeesById,
    shiftsById,
    visibleShiftIdsByDayId,
  ])

  const weekSummaries = React.useMemo(() => {
    return getScheduledCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days: boardData.days,
      employeesById,
      location: boardData.location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
    })
  }, [
    allShiftIdsByDayId,
    assignmentIdsByShiftId,
    assignmentsById,
    boardData.days,
    boardData.location,
    employeesById,
    shiftsById,
  ])

  const zoneSummaries = React.useMemo(() => {
    return getScheduledZoneCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days: boardData.days,
      employeesById,
      location: boardData.location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
      zones: boardData.zones,
    })
  }, [
    allShiftIdsByDayId,
    assignmentIdsByShiftId,
    assignmentsById,
    boardData.days,
    boardData.location,
    boardData.zones,
    employeesById,
    shiftsById,
  ])

  const shiftCostSummaries = React.useMemo(() => {
    return getScheduledShiftCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days: boardData.days,
      employeesById,
      location: boardData.location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
      zones: boardData.zones,
    })
  }, [
    allShiftIdsByDayId,
    assignmentIdsByShiftId,
    assignmentsById,
    boardData.days,
    boardData.location,
    boardData.zones,
    employeesById,
    shiftsById,
  ])

  const budgetInsights = React.useMemo(() => {
    return buildBudgetInsights({
      budgetPence: meta.budgetPence,
      days: boardData.days,
      daySummaries: weekSummaries,
      shiftSummaries: shiftCostSummaries,
      zoneSummaries,
    })
  }, [
    boardData.days,
    meta.budgetPence,
    shiftCostSummaries,
    weekSummaries,
    zoneSummaries,
  ])

  const totalScheduledMinutes = React.useMemo(() => {
    return weekSummaries.reduce((sum, day) => sum + day.totalMinutes, 0)
  }, [weekSummaries])

  const totalScheduledCost = React.useMemo(() => {
    return weekSummaries.reduce((sum, day) => sum + day.totalCost, 0)
  }, [weekSummaries])

  const getEmployee = React.useCallback(
    (employeeId: string) =>
      employeesById[employeeId] as WorkspaceEmployee | undefined,
    [employeesById]
  )

  const assignEmployeeToShift = React.useCallback(
    async (
      employeeId: string,
      shiftId: string
    ): Promise<WorkspaceAssignmentMutationResult> => {
      let mutationResult: WorkspaceAssignmentMutationResult = {
        status: "success",
      }

      setAssignmentsById((currentAssignments) => {
        const alreadyAssigned = Object.values(currentAssignments).some(
          (assignment) =>
            assignment.shiftId === shiftId &&
            assignment.employeeId === employeeId
        )

        if (alreadyAssigned) {
          mutationResult = { status: "noop" }
          return currentAssignments
        }

        const overlapResult = getAssignmentOverlapResult({
          assignmentsById: currentAssignments,
          days: boardData.days,
          employeeId,
          employeesById,
          location: boardData.location,
          shiftId,
          shiftsById,
          zones: boardData.zones,
        })

        if (overlapResult) {
          mutationResult = overlapResult
          return currentAssignments
        }

        setHasUnsavedChanges(true)

        const nextAssignment: WorkspaceAssignment = {
          id: createLocalId("assignment"),
          employeeId,
          shiftId,
        }

        return {
          ...currentAssignments,
          [nextAssignment.id]: nextAssignment,
        }
      })

      return mutationResult
    },
    [
      boardData.days,
      boardData.location,
      boardData.zones,
      employeesById,
      shiftsById,
    ]
  )

  const moveAssignmentToShift = React.useCallback(
    async (
      assignmentId: string,
      shiftId: string
    ): Promise<WorkspaceAssignmentMutationResult> => {
      let mutationResult: WorkspaceAssignmentMutationResult = {
        status: "success",
      }

      setAssignmentsById((currentAssignments) => {
        const assignment = currentAssignments[assignmentId]

        if (!assignment || assignment.shiftId === shiftId) {
          mutationResult = { status: "noop" }
          return currentAssignments
        }

        const alreadyAssigned = Object.values(currentAssignments).some(
          (entry) =>
            entry.id !== assignmentId &&
            entry.shiftId === shiftId &&
            entry.employeeId === assignment.employeeId
        )

        if (alreadyAssigned) {
          mutationResult = { status: "noop" }
          return currentAssignments
        }

        const overlapResult = getAssignmentOverlapResult({
          assignmentsById: currentAssignments,
          days: boardData.days,
          employeeId: assignment.employeeId,
          employeesById,
          excludeAssignmentId: assignmentId,
          location: boardData.location,
          shiftId,
          shiftsById,
          zones: boardData.zones,
        })

        if (overlapResult) {
          mutationResult = overlapResult
          return currentAssignments
        }

        setHasUnsavedChanges(true)

        return {
          ...currentAssignments,
          [assignmentId]: {
            ...assignment,
            shiftId,
          },
        }
      })

      return mutationResult
    },
    [
      boardData.days,
      boardData.location,
      boardData.zones,
      employeesById,
      shiftsById,
    ]
  )

  const removeAssignment = React.useCallback(async (assignmentId: string) => {
    setAssignmentsById((currentAssignments) => {
      if (!(assignmentId in currentAssignments)) {
        return currentAssignments
      }

      setHasUnsavedChanges(true)

      const nextAssignments = { ...currentAssignments }
      delete nextAssignments[assignmentId]
      return nextAssignments
    })
  }, [])

  const createShift = React.useCallback(
    async (input: CreateWorkspaceShiftInput) => {
      const nextShift: WorkspaceShift = {
        id: createLocalId("shift"),
        ...input,
      }

      const hasMatchingShift = Object.values(shiftsById).some((shift) =>
        shiftsHaveMatchingTimes(shift, nextShift, boardData.location)
      )

      if (hasMatchingShift) {
        throw new Error(
          "A shift with the same start and finish already exists on that day."
        )
      }

      setHasUnsavedChanges(true)
      setShiftsById((currentShifts) => ({
        ...currentShifts,
        [nextShift.id]: nextShift,
      }))

      return nextShift
    },
    [boardData.location, shiftsById]
  )

  const deleteShift = React.useCallback(
    async (shiftId: string) => {
      const shift = shiftsById[shiftId]

      if (!shift) {
        return {
          status: "noop" as const,
          removedAssignmentCount: 0,
        }
      }

      const removedAssignmentIds = Object.values(assignmentsById)
        .filter((assignment) => assignment.shiftId === shiftId)
        .map((assignment) => assignment.id)

      setHasUnsavedChanges(true)
      setShiftsById((currentShifts) => {
        const nextShifts = { ...currentShifts }
        delete nextShifts[shiftId]
        return nextShifts
      })
      setAssignmentsById((currentAssignments) => {
        if (removedAssignmentIds.length === 0) {
          return currentAssignments
        }

        const nextAssignments = { ...currentAssignments }

        for (const assignmentId of removedAssignmentIds) {
          delete nextAssignments[assignmentId]
        }

        return nextAssignments
      })

      return {
        status: "success" as const,
        removedAssignmentCount: removedAssignmentIds.length,
      }
    },
    [assignmentsById, shiftsById]
  )

  const markChangesSaved = React.useCallback(() => {
    setHasUnsavedChanges(false)
    setMeta((currentMeta) => ({
      ...currentMeta,
      hasUnpublishedChanges:
        currentMeta.status === "published"
          ? true
          : currentMeta.hasUnpublishedChanges,
    }))
  }, [])

  const setMetaNote = React.useCallback((note: string | null) => {
    setMeta((currentMeta) => ({
      ...currentMeta,
      note,
      hasUnpublishedChanges:
        currentMeta.status === "published"
          ? true
          : currentMeta.hasUnpublishedChanges,
    }))
  }, [])

  const setBudgetPence = React.useCallback((budgetPence: number | null) => {
    setMeta((currentMeta) => ({ ...currentMeta, budgetPence }))
  }, [])

  const markPublished = React.useCallback(() => {
    setMeta((currentMeta) => ({
      ...currentMeta,
      status: "published",
      publishedVersion: currentMeta.publishedVersion + 1,
      hasUnpublishedChanges: false,
      publishedSnapshotAvailable: true,
    }))
    setHasUnsavedChanges(false)
  }, [])

  return {
    assignmentsById,
    assignmentIdsByShiftId,
    assignEmployeeToShift,
    budgetInsights,
    createShift,
    dayInsightsById: workspaceInsights.dayInsightsById,
    daySummaries,
    deleteShift,
    days: boardData.days,
    employeeGroups,
    employeeMetricsById: workspaceInsights.employeeMetricsById,
    employeesById,
    formatCurrency,
    formatMinutesAsHours,
    getEmployee,
    getZoneAppearance,
    hasUnsavedChanges,
    isDemo: mode === "demo",
    locations: [boardData.location],
    markChangesSaved,
    meta,
    markPublished,
    moveAssignmentToShift,
    removeAssignment,
    searchQuery,
    selectedLocation: boardData.location,
    selectedLocationId: boardData.location.id,
    selectedZoneId,
    setSearchQuery,
    setMetaNote,
    setBudgetPence,
    setSelectedLocationId: (_locationId: string) => undefined,
    setSelectedZoneId,
    shiftIdsByDayId: visibleShiftIdsByDayId,
    shiftInsightsById: workspaceInsights.shiftInsightsById,
    shiftCostSummaries,
    shiftsById,
    templates: boardData.templates,
    totalScheduledCost,
    totalScheduledMinutes,
    unavailableEmployeeIdsByDayId:
      workspaceInsights.unavailableEmployeeIdsByDayId,
    zones: boardData.zones,
    zoneSummaries,
  }
}

function mapById<TItem extends { id: string }>(items: TItem[]) {
  return items.reduce<Record<string, TItem>>((map, item) => {
    map[item.id] = item
    return map
  }, {})
}

function createLocalId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1000)}`

  return `${prefix}-${id}`
}

function getAssignmentOverlapResult({
  assignmentsById,
  days,
  employeeId,
  employeesById,
  excludeAssignmentId,
  location,
  shiftId,
  shiftsById,
  zones,
}: {
  assignmentsById: Record<string, WorkspaceAssignment>
  days: WorkspaceBoardData["days"]
  employeeId: string
  employeesById: Record<string, WorkspaceEmployee>
  excludeAssignmentId?: string
  location: WorkspaceBoardData["location"]
  shiftId: string
  shiftsById: Record<string, WorkspaceShift>
  zones: WorkspaceZone[]
}): WorkspaceAssignmentMutationResult | null {
  const nextShift = shiftsById[shiftId]

  if (!nextShift) {
    return null
  }

  const hasOverlap = Object.values(assignmentsById).some((assignment) => {
    if (assignment.employeeId !== employeeId) {
      return false
    }

    if (excludeAssignmentId && assignment.id === excludeAssignmentId) {
      return false
    }

    const existingShift = shiftsById[assignment.shiftId]

    if (!existingShift) {
      return false
    }

    const existingSegments = getShiftAbsoluteSegments(existingShift, {
      days,
      location,
    })
    const nextSegments = getShiftAbsoluteSegments(nextShift, {
      days,
      location,
    })

    return existingSegments.some((existingSegment) =>
      nextSegments.some(
        (nextSegment) =>
          existingSegment.startMinutes < nextSegment.endMinutes &&
          nextSegment.startMinutes < existingSegment.endMinutes
      )
    )
  })

  if (!hasOverlap) {
    return null
  }

  const employeeName = employeesById[employeeId]?.name ?? "This team member"
  const day = days.find((entry) => entry.id === nextShift.dayId)
  const zoneName =
    zones.find((entry) => entry.id === nextShift.zoneId)?.name ??
    nextShift.zoneName ??
    "this zone"

  return {
    status: "overlap",
    employeeName,
    dayLabel: day?.shortLabel ?? "that day",
    zoneName,
  }
}

export { useRotaWorkspaceState }

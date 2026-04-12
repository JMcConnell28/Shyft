"use client"

import * as React from "react"

import {
  placeholderAssignments,
  placeholderDays,
  placeholderEmployeeGroups,
  placeholderEmployees,
  placeholderLocations,
  placeholderShifts,
  placeholderZones,
} from "@/features/rota/constants/placeholder-workspace"
import type {
  CreateWorkspaceShiftInput,
  WorkspaceAssignment,
  WorkspaceEmployee,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import {
  formatMinutesAsHours,
  getShiftDurationMinutes,
} from "@/features/rota/utils/workspace-time"

function useRotaWorkspaceState() {
  const [selectedLocationId, setSelectedLocationId] = React.useState(
    placeholderLocations[0]?.id ?? "",
  )
  const [selectedZoneId, setSelectedZoneId] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [shiftsById, setShiftsById] = React.useState(() => mapById(placeholderShifts))
  const [assignmentsById, setAssignmentsById] = React.useState(() =>
    mapById(placeholderAssignments),
  )

  const employeesById = React.useMemo(() => mapById(placeholderEmployees), [])
  const lowerSearchQuery = searchQuery.trim().toLowerCase()

  const visibleShiftIdsByDayId = React.useMemo(() => {
    return placeholderDays.reduce<Record<string, string[]>>((map, day) => {
      map[day.id] = Object.values(shiftsById)
        .filter((shift) => shift.dayId === day.id)
        .filter((shift) => selectedZoneId === "all" || shift.zoneId === selectedZoneId)
        .map((shift) => shift.id)

      return map
    }, {})
  }, [selectedZoneId, shiftsById])

  const assignmentIdsByShiftId = React.useMemo(() => {
    return Object.values(assignmentsById).reduce<Record<string, string[]>>((map, assignment) => {
      const list = map[assignment.shiftId] ?? []
      list.push(assignment.id)
      map[assignment.shiftId] = list
      return map
    }, {})
  }, [assignmentsById])

  const employeeMetricsById = React.useMemo(() => {
    return Object.values(assignmentsById).reduce<
      Record<string, { shiftCount: number; scheduledMinutes: number }>
    >((map, assignment) => {
      const shift = shiftsById[assignment.shiftId]

      if (!shift) {
        return map
      }

      const current = map[assignment.employeeId] ?? {
        shiftCount: 0,
        scheduledMinutes: 0,
      }

      current.shiftCount += 1
      current.scheduledMinutes += getShiftDurationMinutes(
        shift.startTime,
        shift.endTime,
      )
      map[assignment.employeeId] = current

      return map
    }, {})
  }, [assignmentsById, shiftsById])

  const employeeGroups = React.useMemo(() => {
    return placeholderEmployeeGroups
      .map((group) => {
        const employeeIds = placeholderEmployees
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
  }, [lowerSearchQuery])

  const daySummaries = React.useMemo(() => {
    return placeholderDays.map((day) => {
      const totalMinutes = (visibleShiftIdsByDayId[day.id] ?? []).reduce(
        (minutes, shiftId) => {
          const assignmentIds = assignmentIdsByShiftId[shiftId] ?? []
          const shift = shiftsById[shiftId]

          if (!shift) {
            return minutes
          }

          return (
            minutes +
            assignmentIds.length * getShiftDurationMinutes(shift.startTime, shift.endTime)
          )
        },
        0,
      )

      return {
        dayId: day.id,
        totalMinutes,
        totalShifts: (visibleShiftIdsByDayId[day.id] ?? []).length,
      }
    })
  }, [assignmentIdsByShiftId, shiftsById, visibleShiftIdsByDayId])

  const totalScheduledMinutes = React.useMemo(() => {
    return daySummaries.reduce((sum, day) => sum + day.totalMinutes, 0)
  }, [daySummaries])

  const assignEmployeeToShift = React.useCallback((employeeId: string, shiftId: string) => {
    setAssignmentsById((currentAssignments) => {
      const alreadyAssigned = Object.values(currentAssignments).some(
        (assignment) =>
          assignment.shiftId === shiftId && assignment.employeeId === employeeId,
      )

      if (alreadyAssigned) {
        return currentAssignments
      }

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
  }, [])

  const moveAssignmentToShift = React.useCallback((assignmentId: string, shiftId: string) => {
    setAssignmentsById((currentAssignments) => {
      const assignment = currentAssignments[assignmentId]

      if (!assignment || assignment.shiftId === shiftId) {
        return currentAssignments
      }

      const alreadyAssigned = Object.values(currentAssignments).some(
        (entry) =>
          entry.id !== assignmentId &&
          entry.shiftId === shiftId &&
          entry.employeeId === assignment.employeeId,
      )

      if (alreadyAssigned) {
        return currentAssignments
      }

      return {
        ...currentAssignments,
        [assignmentId]: {
          ...assignment,
          shiftId,
        },
      }
    })
  }, [])

  const removeAssignment = React.useCallback((assignmentId: string) => {
    setAssignmentsById((currentAssignments) => {
      if (!(assignmentId in currentAssignments)) {
        return currentAssignments
      }

      const nextAssignments = { ...currentAssignments }
      delete nextAssignments[assignmentId]
      return nextAssignments
    })
  }, [])

  const createShift = React.useCallback((input: CreateWorkspaceShiftInput) => {
    const nextShift: WorkspaceShift = {
      id: createLocalId("shift"),
      ...input,
    }

    setShiftsById((currentShifts) => ({
      ...currentShifts,
      [nextShift.id]: nextShift,
    }))

    return nextShift
  }, [])

  const getEmployee = React.useCallback(
    (employeeId: string) => employeesById[employeeId] as WorkspaceEmployee | undefined,
    [employeesById],
  )

  return {
    assignmentsById,
    assignmentIdsByShiftId,
    createShift,
    daySummaries,
    days: placeholderDays,
    employeeGroups,
    employeeMetricsById,
    employeesById,
    formatMinutesAsHours,
    getEmployee,
    locations: placeholderLocations,
    moveAssignmentToShift,
    removeAssignment,
    searchQuery,
    selectedLocationId,
    selectedZoneId,
    setSearchQuery,
    setSelectedLocationId,
    setSelectedZoneId,
    shiftIdsByDayId: visibleShiftIdsByDayId,
    shiftsById,
    totalScheduledMinutes,
    zones: placeholderZones,
    assignEmployeeToShift,
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

export { useRotaWorkspaceState }

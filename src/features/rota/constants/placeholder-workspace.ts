import { addDays, format, startOfWeek } from "date-fns"

import type {
  WorkspaceAssignment,
  WorkspaceDay,
  WorkspaceEmployee,
  WorkspaceEmployeeGroup,
  WorkspaceLocation,
  WorkspaceShift,
  WorkspaceZone,
} from "@/features/rota/types/workspace"

const placeholderLocations: WorkspaceLocation[] = [
  {
    id: "location-main",
    name: "Main venue",
  },
]

const placeholderZones: WorkspaceZone[] = [
  { id: "zone-bar", name: "Bar" },
  { id: "zone-floor", name: "Floor" },
  { id: "zone-kitchen", name: "Kitchen" },
]

const placeholderEmployeeGroups: WorkspaceEmployeeGroup[] = [
  { id: "group-bar", name: "Bar staff" },
  { id: "group-floor", name: "Floor staff" },
  { id: "group-kitchen", name: "Kitchen" },
]

const placeholderEmployees: WorkspaceEmployee[] = [
  { id: "emp-jack", name: "Jack McConnell", groupId: "group-bar", weeklyHours: 38 },
  { id: "emp-ruby", name: "Ruby Lewis", groupId: "group-bar", weeklyHours: 32 },
  { id: "emp-owen", name: "Owen Clark", groupId: "group-bar", weeklyHours: 24 },
  { id: "emp-millie", name: "Millie Hall", groupId: "group-floor", weeklyHours: 30 },
  { id: "emp-ava", name: "Ava Morgan", groupId: "group-floor", weeklyHours: 26 },
  { id: "emp-noah", name: "Noah Reid", groupId: "group-floor", weeklyHours: 18 },
  { id: "emp-ella", name: "Ella Woods", groupId: "group-kitchen", weeklyHours: 40 },
  { id: "emp-hugo", name: "Hugo Price", groupId: "group-kitchen", weeklyHours: 36 },
  { id: "emp-luca", name: "Luca Dean", groupId: "group-kitchen", weeklyHours: 20 },
]

function buildPlaceholderDays() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index)

    return {
      id: `day-${format(date, "yyyy-MM-dd")}`,
      isoDate: format(date, "yyyy-MM-dd"),
      shortLabel: format(date, "EEE"),
      dayNumber: format(date, "d"),
      monthLabel: format(date, "MMM"),
    } satisfies WorkspaceDay
  })
}

const placeholderDays = buildPlaceholderDays()

const placeholderShifts: WorkspaceShift[] = [
  {
    id: "shift-mon-bar-open",
    dayId: placeholderDays[0]!.id,
    zoneId: "zone-bar",
    startTime: "09:00",
    endTime: "16:00",
  },
  {
    id: "shift-mon-floor-close",
    dayId: placeholderDays[0]!.id,
    zoneId: "zone-floor",
    startTime: "16:00",
    endTime: "23:00",
  },
  {
    id: "shift-tue-kitchen-prep",
    dayId: placeholderDays[1]!.id,
    zoneId: "zone-kitchen",
    startTime: "08:00",
    endTime: "15:00",
  },
  {
    id: "shift-wed-bar-close",
    dayId: placeholderDays[2]!.id,
    zoneId: "zone-bar",
    startTime: "17:00",
    endTime: "23:30",
  },
  {
    id: "shift-thu-floor-lunch",
    dayId: placeholderDays[3]!.id,
    zoneId: "zone-floor",
    startTime: "11:00",
    endTime: "17:00",
  },
  {
    id: "shift-fri-kitchen-close",
    dayId: placeholderDays[4]!.id,
    zoneId: "zone-kitchen",
    startTime: "15:00",
    endTime: "23:00",
  },
  {
    id: "shift-sat-bar-all-day",
    dayId: placeholderDays[5]!.id,
    zoneId: "zone-bar",
    startTime: "12:00",
    endTime: "22:00",
  },
  {
    id: "shift-sun-floor-brunch",
    dayId: placeholderDays[6]!.id,
    zoneId: "zone-floor",
    startTime: "10:00",
    endTime: "16:00",
  },
]

const placeholderAssignments: WorkspaceAssignment[] = [
  { id: "assignment-1", employeeId: "emp-jack", shiftId: "shift-mon-bar-open" },
  { id: "assignment-2", employeeId: "emp-ruby", shiftId: "shift-mon-bar-open" },
  { id: "assignment-3", employeeId: "emp-millie", shiftId: "shift-mon-floor-close" },
  { id: "assignment-4", employeeId: "emp-ella", shiftId: "shift-tue-kitchen-prep" },
  { id: "assignment-5", employeeId: "emp-owen", shiftId: "shift-wed-bar-close" },
  { id: "assignment-6", employeeId: "emp-ava", shiftId: "shift-thu-floor-lunch" },
  { id: "assignment-7", employeeId: "emp-hugo", shiftId: "shift-fri-kitchen-close" },
  { id: "assignment-8", employeeId: "emp-jack", shiftId: "shift-sat-bar-all-day" },
]

export {
  placeholderAssignments,
  placeholderDays,
  placeholderEmployeeGroups,
  placeholderEmployees,
  placeholderLocations,
  placeholderShifts,
  placeholderZones,
}

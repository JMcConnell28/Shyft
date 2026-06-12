import { addDays, format, startOfWeek } from "date-fns"

import type {
  WorkspaceAssignment,
  WorkspaceDay,
  WorkspaceEmployee,
  WorkspaceEmployeeGroup,
  WorkspaceLocation,
  WorkspaceShiftSegment,
  WorkspaceShift,
  WorkspaceZone,
} from "@/features/rota/types/workspace"

const placeholderDays = buildPlaceholderDays()

const placeholderLocations: WorkspaceLocation[] = [
  {
    id: "location-main",
    name: "Main venue",
    estimatedCloseTime: "23:00",
    estimatedCloseTimeNextDay: false,
    closeTimeByDayId: buildCloseTimesByDayId([
      "23:30",
      "23:00",
      "23:30",
      "23:30",
      "00:30",
      "01:00",
      "22:00",
    ]),
    closeTimeNextDayByDayId: {},
  },
]

const placeholderZones: WorkspaceZone[] = [
  { id: "zone-bar", name: "Bar" },
  { id: "zone-floor", name: "Floor" },
  { id: "zone-kitchen", name: "Kitchen" },
]

const placeholderEmployeeGroups: WorkspaceEmployeeGroup[] = [
  { id: "group-bar", name: "Bar staff", color: "amber" },
  { id: "group-floor", name: "Floor staff", color: "sky" },
  { id: "group-kitchen", name: "Kitchen", color: "rose" },
]

const placeholderEmployees = withGroupColors([
  { id: "emp-ivy", name: "Ivy", groupId: "group-bar", weeklyHours: 16 },
  { id: "emp-jack", name: "Jack McConnell", groupId: "group-bar", weeklyHours: 38 },
  { id: "emp-zoe", name: "Zoe Patel", groupId: "group-bar", weeklyHours: 22 },
  { id: "emp-ruby", name: "Ruby Lewis", groupId: "group-bar", weeklyHours: 32 },
  { id: "emp-owen", name: "Owen Clark", groupId: "group-bar", weeklyHours: 24 },
  {
    id: "emp-alexander",
    name: "Alexander Montgomery-Reid",
    groupId: "group-bar",
    weeklyHours: 40,
  },
  { id: "emp-layla", name: "Layla Brooks", groupId: "group-bar", weeklyHours: 20 },
  { id: "emp-finn", name: "Finn Carter", groupId: "group-bar", weeklyHours: 18 },
  { id: "emp-imogen", name: "Imogen Price", groupId: "group-bar", weeklyHours: 26 },
  { id: "emp-harvey", name: "Harvey Cole", groupId: "group-bar", weeklyHours: 30 },
  {
    id: "emp-evangeline",
    name: "Evangeline Harper-Sullivan",
    groupId: "group-bar",
    weeklyHours: 34,
  },
  { id: "emp-rio", name: "Rio", groupId: "group-bar", weeklyHours: 12 },
  { id: "emp-bo", name: "Bo Li", groupId: "group-floor", weeklyHours: 14 },
  { id: "emp-millie", name: "Millie Hall", groupId: "group-floor", weeklyHours: 30 },
  { id: "emp-ava", name: "Ava Morgan", groupId: "group-floor", weeklyHours: 26 },
  { id: "emp-noah", name: "Noah Reid", groupId: "group-floor", weeklyHours: 18 },
  {
    id: "emp-scarlett",
    name: "Scarlett-Jane Willoughby",
    groupId: "group-floor",
    weeklyHours: 28,
  },
  {
    id: "emp-mia",
    name: "Mia-Rose Thompson",
    groupId: "group-floor",
    weeklyHours: 24,
  },
  { id: "emp-leo", name: "Leo Hart", groupId: "group-floor", weeklyHours: 16 },
  { id: "emp-sadie", name: "Sadie Green", groupId: "group-floor", weeklyHours: 22 },
  { id: "emp-amber", name: "Amber Khan", groupId: "group-floor", weeklyHours: 20 },
  { id: "emp-roman", name: "Roman Wells", groupId: "group-floor", weeklyHours: 28 },
  {
    id: "emp-annabelle",
    name: "Annabelle Fitzgerald",
    groupId: "group-floor",
    weeklyHours: 32,
  },
  {
    id: "emp-theodore",
    name: "Theodore James Whitaker",
    groupId: "group-floor",
    weeklyHours: 36,
  },
  { id: "emp-lila", name: "Lila Stone", groupId: "group-floor", weeklyHours: 18 },
  { id: "emp-aj", name: "AJ", groupId: "group-kitchen", weeklyHours: 12 },
  { id: "emp-ella", name: "Ella Woods", groupId: "group-kitchen", weeklyHours: 40 },
  { id: "emp-hugo", name: "Hugo Price", groupId: "group-kitchen", weeklyHours: 36 },
  { id: "emp-luca", name: "Luca Dean", groupId: "group-kitchen", weeklyHours: 20 },
  {
    id: "emp-mohammed",
    name: "Mohammed Abdul-Rahman",
    groupId: "group-kitchen",
    weeklyHours: 34,
  },
  {
    id: "emp-christopher",
    name: "Christopher Benjamin Edwards",
    groupId: "group-kitchen",
    weeklyHours: 38,
  },
  { id: "emp-nina", name: "Nina Ross", groupId: "group-kitchen", weeklyHours: 24 },
  { id: "emp-kai", name: "Kai Murphy", groupId: "group-kitchen", weeklyHours: 16 },
  { id: "emp-isla", name: "Isla Bennett", groupId: "group-kitchen", weeklyHours: 28 },
  {
    id: "emp-sebastian",
    name: "Sebastian Walker-Hughes",
    groupId: "group-kitchen",
    weeklyHours: 35,
  },
  { id: "emp-remy", name: "Remy Fox", groupId: "group-kitchen", weeklyHours: 14 },
  { id: "emp-poppy", name: "Poppy Shaw", groupId: "group-kitchen", weeklyHours: 21 },
  {
    id: "emp-mateo",
    name: "Mateo Alvarez",
    groupId: "group-kitchen",
    weeklyHours: 27,
  },
] satisfies Array<Omit<WorkspaceEmployee, "groupColor">>)

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

function withGroupColors(
  employees: Array<Omit<WorkspaceEmployee, "groupColor">>,
) {
  const colorByGroupId = new Map(
    placeholderEmployeeGroups.map((group) => [group.id, group.color]),
  )

  return employees.map((employee) => ({
    ...employee,
    groupColor: colorByGroupId.get(employee.groupId) ?? "slate",
  })) satisfies WorkspaceEmployee[]
}

function createStandardShift(
  id: string,
  dayIndex: number,
  zoneId: WorkspaceZone["id"],
  startTime: string,
  endTime: string
) {
  return {
    id,
    dayId: placeholderDays[dayIndex]!.id,
    zoneId,
    shiftType: "standard",
    startTime,
    endTime,
  } satisfies WorkspaceShift
}

function createClosingShift(
  id: string,
  dayIndex: number,
  zoneId: WorkspaceZone["id"],
  startTime: string
) {
  return {
    id,
    dayId: placeholderDays[dayIndex]!.id,
    zoneId,
    shiftType: "closing",
    startTime,
    endKind: "locationClose",
  } satisfies WorkspaceShift
}

function createSplitShift(
  id: string,
  dayIndex: number,
  zoneId: WorkspaceZone["id"],
  segments: [WorkspaceShiftSegment, WorkspaceShiftSegment]
) {
  return {
    id,
    dayId: placeholderDays[dayIndex]!.id,
    zoneId,
    shiftType: "split",
    segments,
  } satisfies WorkspaceShift
}

const placeholderShifts: WorkspaceShift[] = [
  createStandardShift("shift-mon-bar-open", 0, "zone-bar", "09:00", "15:00"),
  createStandardShift("shift-mon-floor-lunch", 0, "zone-floor", "10:00", "16:00"),
  createStandardShift("shift-mon-kitchen-prep", 0, "zone-kitchen", "08:00", "14:00"),
  createClosingShift("shift-mon-bar-close", 0, "zone-bar", "16:00"),
  createClosingShift("shift-mon-floor-close", 0, "zone-floor", "17:00"),
  createStandardShift("shift-mon-kitchen-close", 0, "zone-kitchen", "15:00", "22:30"),

  createStandardShift("shift-tue-bar-open", 1, "zone-bar", "09:00", "15:00"),
  createStandardShift("shift-tue-floor-lunch", 1, "zone-floor", "11:00", "17:00"),
  createStandardShift("shift-tue-kitchen-prep", 1, "zone-kitchen", "08:00", "15:00"),
  createClosingShift("shift-tue-bar-close", 1, "zone-bar", "16:00"),
  createClosingShift("shift-tue-floor-close", 1, "zone-floor", "17:00"),
  createStandardShift("shift-tue-kitchen-close", 1, "zone-kitchen", "15:00", "22:30"),

  createStandardShift("shift-wed-bar-open", 2, "zone-bar", "09:00", "15:30"),
  createStandardShift("shift-wed-floor-lunch", 2, "zone-floor", "11:00", "17:00"),
  createStandardShift("shift-wed-kitchen-prep", 2, "zone-kitchen", "08:00", "14:30"),
  createClosingShift("shift-wed-bar-close", 2, "zone-bar", "17:00"),
  createClosingShift("shift-wed-floor-close", 2, "zone-floor", "17:30"),
  createStandardShift("shift-wed-kitchen-close", 2, "zone-kitchen", "15:00", "22:30"),

  createStandardShift("shift-thu-bar-open", 3, "zone-bar", "09:00", "15:00"),
  createStandardShift("shift-thu-floor-lunch", 3, "zone-floor", "10:30", "16:30"),
  createStandardShift("shift-thu-kitchen-prep", 3, "zone-kitchen", "08:00", "14:00"),
  createClosingShift("shift-thu-bar-close", 3, "zone-bar", "16:00"),
  createClosingShift("shift-thu-floor-close", 3, "zone-floor", "17:00"),
  createStandardShift("shift-thu-kitchen-close", 3, "zone-kitchen", "15:00", "22:30"),

  createStandardShift("shift-fri-bar-open", 4, "zone-bar", "09:00", "16:00"),
  createStandardShift("shift-fri-floor-lunch", 4, "zone-floor", "11:00", "17:30"),
  createStandardShift("shift-fri-kitchen-prep", 4, "zone-kitchen", "08:00", "15:00"),
  createSplitShift("shift-fri-bar-mid", 4, "zone-bar", [
    { startTime: "13:00", endTime: "16:00" },
    { startTime: "17:00", endTime: "20:00" },
  ]),
  createStandardShift("shift-fri-floor-evening", 4, "zone-floor", "15:00", "22:00"),
  createStandardShift("shift-fri-kitchen-close", 4, "zone-kitchen", "15:00", "23:00"),
  createClosingShift("shift-fri-bar-close", 4, "zone-bar", "17:00"),
  createClosingShift("shift-fri-floor-close", 4, "zone-floor", "18:00"),

  createStandardShift("shift-sat-bar-open", 5, "zone-bar", "08:30", "15:30"),
  createStandardShift("shift-sat-floor-brunch", 5, "zone-floor", "09:00", "15:00"),
  createStandardShift("shift-sat-kitchen-prep", 5, "zone-kitchen", "08:00", "14:00"),
  createStandardShift("shift-sat-bar-mid", 5, "zone-bar", "12:00", "19:00"),
  createSplitShift("shift-sat-floor-mid", 5, "zone-floor", [
    { startTime: "12:00", endTime: "15:30" },
    { startTime: "16:30", endTime: "19:00" },
  ]),
  createStandardShift("shift-sat-kitchen-service", 5, "zone-kitchen", "12:00", "19:30"),
  createClosingShift("shift-sat-bar-close", 5, "zone-bar", "17:00"),
  createClosingShift("shift-sat-floor-close", 5, "zone-floor", "17:00"),
  createStandardShift("shift-sat-kitchen-close", 5, "zone-kitchen", "16:00", "23:30"),
  createStandardShift("shift-sat-late-bar", 5, "zone-bar", "19:00", "02:00"),
  createStandardShift("shift-sat-late-floor", 5, "zone-floor", "19:00", "02:00"),
  createStandardShift("shift-sat-late-kitchen", 5, "zone-kitchen", "18:00", "00:30"),

  createStandardShift("shift-sun-bar-brunch", 6, "zone-bar", "10:00", "16:00"),
  createStandardShift("shift-sun-floor-brunch", 6, "zone-floor", "10:00", "16:00"),
  createStandardShift("shift-sun-kitchen-brunch", 6, "zone-kitchen", "09:00", "15:30"),
  createClosingShift("shift-sun-bar-close", 6, "zone-bar", "15:00"),
  createClosingShift("shift-sun-floor-close", 6, "zone-floor", "15:30"),
  createStandardShift("shift-sun-kitchen-close", 6, "zone-kitchen", "14:00", "21:30"),
]

function createAssignments(
  shiftId: WorkspaceShift["id"],
  employeeIds: WorkspaceEmployee["id"][]
) {
  return employeeIds.map((employeeId, index) => ({
    id: `${shiftId}-assignment-${index + 1}`,
    employeeId,
    shiftId,
  })) satisfies WorkspaceAssignment[]
}

function buildCloseTimesByDayId(closeTimes: string[]) {
  return placeholderDays.reduce<Record<string, string>>((map, day, index) => {
    map[day.id] = closeTimes[index] ?? closeTimes[0] ?? "23:00"
    return map
  }, {})
}

const placeholderAssignments: WorkspaceAssignment[] = [
  ...createAssignments("shift-mon-bar-open", ["emp-jack", "emp-ruby"]),
  ...createAssignments("shift-mon-floor-lunch", ["emp-millie", "emp-ava"]),
  ...createAssignments("shift-mon-kitchen-prep", ["emp-ella", "emp-luca"]),
  ...createAssignments("shift-mon-bar-close", ["emp-owen", "emp-layla", "emp-finn"]),
  ...createAssignments("shift-mon-floor-close", ["emp-noah", "emp-scarlett", "emp-mia"]),
  ...createAssignments("shift-mon-kitchen-close", ["emp-hugo", "emp-mohammed"]),

  ...createAssignments("shift-tue-bar-open", ["emp-ivy", "emp-imogen"]),
  ...createAssignments("shift-tue-floor-lunch", ["emp-bo", "emp-leo"]),
  ...createAssignments("shift-tue-kitchen-prep", ["emp-aj", "emp-nina"]),
  ...createAssignments("shift-tue-bar-close", ["emp-jack", "emp-harvey", "emp-rio"]),
  ...createAssignments("shift-tue-floor-close", ["emp-amber", "emp-roman", "emp-lila"]),
  ...createAssignments("shift-tue-kitchen-close", ["emp-kai", "emp-isla", "emp-remy"]),

  ...createAssignments("shift-wed-bar-open", ["emp-zoe", "emp-ruby"]),
  ...createAssignments("shift-wed-floor-lunch", ["emp-millie", "emp-sadie"]),
  ...createAssignments("shift-wed-kitchen-prep", ["emp-luca", "emp-poppy"]),
  ...createAssignments("shift-wed-bar-close", ["emp-alexander", "emp-layla", "emp-finn"]),
  ...createAssignments("shift-wed-floor-close", ["emp-annabelle", "emp-theodore", "emp-ava"]),
  ...createAssignments("shift-wed-kitchen-close", ["emp-sebastian", "emp-mateo"]),

  ...createAssignments("shift-thu-bar-open", ["emp-ivy", "emp-rio"]),
  ...createAssignments("shift-thu-floor-lunch", ["emp-bo", "emp-leo", "emp-lila"]),
  ...createAssignments("shift-thu-kitchen-prep", ["emp-aj", "emp-nina"]),
  ...createAssignments("shift-thu-bar-close", ["emp-jack", "emp-harvey", "emp-evangeline"]),
  ...createAssignments("shift-thu-floor-close", ["emp-noah", "emp-amber", "emp-roman"]),
  ...createAssignments("shift-thu-kitchen-close", ["emp-hugo", "emp-mohammed", "emp-kai"]),

  ...createAssignments("shift-fri-bar-open", ["emp-zoe", "emp-ruby", "emp-imogen"]),
  ...createAssignments("shift-fri-floor-lunch", ["emp-millie", "emp-sadie", "emp-ava"]),
  ...createAssignments("shift-fri-kitchen-prep", ["emp-ella", "emp-luca", "emp-nina"]),
  ...createAssignments("shift-fri-bar-mid", ["emp-owen", "emp-finn", "emp-rio"]),
  ...createAssignments("shift-fri-floor-evening", ["emp-scarlett", "emp-amber", "emp-lila"]),
  ...createAssignments("shift-fri-kitchen-close", ["emp-hugo", "emp-isla", "emp-remy"]),
  ...createAssignments("shift-fri-bar-close", ["emp-alexander", "emp-harvey", "emp-evangeline"]),
  ...createAssignments("shift-fri-floor-close", ["emp-annabelle", "emp-theodore", "emp-roman"]),

  ...createAssignments("shift-sat-bar-open", ["emp-ivy", "emp-jack", "emp-zoe"]),
  ...createAssignments("shift-sat-floor-brunch", [
    "emp-bo",
    "emp-millie",
    "emp-ava",
  ]),
  ...createAssignments("shift-sat-kitchen-prep", ["emp-aj", "emp-ella", "emp-luca"]),
  ...createAssignments("shift-sat-bar-mid", [
    "emp-ruby",
    "emp-owen",
    "emp-layla",
  ]),
  ...createAssignments("shift-sat-floor-mid", [
    "emp-noah",
    "emp-scarlett",
    "emp-mia",
  ]),
  ...createAssignments("shift-sat-kitchen-service", [
    "emp-hugo",
    "emp-mohammed",
    "emp-christopher",
  ]),
  ...createAssignments("shift-sat-bar-close", [
    "emp-alexander",
    "emp-finn",
    "emp-imogen",
  ]),
  ...createAssignments("shift-sat-floor-close", [
    "emp-leo",
    "emp-sadie",
    "emp-amber",
  ]),
  ...createAssignments("shift-sat-kitchen-close", [
    "emp-nina",
    "emp-kai",
    "emp-isla",
  ]),
  ...createAssignments("shift-sat-late-bar", [
    "emp-harvey",
    "emp-evangeline",
    "emp-rio",
  ]),
  ...createAssignments("shift-sat-late-floor", [
    "emp-roman",
    "emp-annabelle",
    "emp-theodore",
    "emp-lila",
  ]),
  ...createAssignments("shift-sat-late-kitchen", [
    "emp-sebastian",
    "emp-remy",
    "emp-poppy",
    "emp-mateo",
  ]),

  ...createAssignments("shift-sun-bar-brunch", ["emp-jack", "emp-zoe"]),
  ...createAssignments("shift-sun-floor-brunch", ["emp-millie", "emp-ava"]),
  ...createAssignments("shift-sun-kitchen-brunch", ["emp-ella", "emp-hugo"]),
  ...createAssignments("shift-sun-bar-close", ["emp-ruby", "emp-owen"]),
  ...createAssignments("shift-sun-floor-close", ["emp-scarlett", "emp-mia"]),
  ...createAssignments("shift-sun-kitchen-close", ["emp-mohammed", "emp-christopher"]),
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

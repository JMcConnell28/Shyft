import type {
  WorkspaceBoardData,
  WorkspaceClosingShift,
  WorkspaceSplitShift,
  WorkspaceStandardShift,
} from "@/features/rota/types/workspace"
import { DEFAULT_MINIMUM_WAGE_PENCE } from "@/features/staff-groups/utils/minimum-wage"

const demoDays = [
  ["monday", "2026-06-08", "Mon", "8", "Jun"],
  ["tuesday", "2026-06-09", "Tue", "9", "Jun"],
  ["wednesday", "2026-06-10", "Wed", "10", "Jun"],
  ["thursday", "2026-06-11", "Thu", "11", "Jun"],
  ["friday", "2026-06-12", "Fri", "12", "Jun"],
  ["saturday", "2026-06-13", "Sat", "13", "Jun"],
  ["sunday", "2026-06-14", "Sun", "14", "Jun"],
] as const

const demoCloseTimes = demoDays.reduce<Record<string, string>>((map, [id]) => {
  map[id] = id === "friday" || id === "saturday" ? "00:30" : "23:00"
  return map
}, {})

const demoCloseNextDay = demoDays.reduce<Record<string, boolean>>(
  (map, [id]) => {
    map[id] = id === "friday" || id === "saturday"
    return map
  },
  {}
)

const demoRotaBoardData = {
  meta: {
    rotaId: "demo-rota-current-week",
    status: "draft",
    canManage: true,
    canEdit: true,
    organizationId: null,
    userId: "demo-user",
    workspaceType: "location",
    note: "Opening\n- Daily manager handover at 10:45\n\nEvents\n- Live music Friday and Saturday from 20:00",
    weekStart: "2026-06-08",
    weekEnd: "2026-06-14",
    weekLabel: "8 - 14 Jun 2026",
    publishedVersion: 0,
    hasUnpublishedChanges: false,
    publishedSnapshotAvailable: false,
    budgetPence: 475000,
  },
  location: {
    id: "demo-location",
    name: "Harbour House",
    slug: "harbour-house",
    closeTimeByDayId: demoCloseTimes,
    closeTimeNextDayByDayId: demoCloseNextDay,
    estimatedCloseTime: "23:00",
    estimatedCloseTimeNextDay: false,
  },
  days: demoDays.map(([id, isoDate, shortLabel, dayNumber, monthLabel]) => ({
    id,
    isoDate,
    shortLabel,
    dayNumber,
    monthLabel,
  })),
  zones: [
    { id: "floor", name: "Floor" },
    { id: "bar", name: "Bar" },
    { id: "kitchen", name: "Kitchen" },
    { id: "events", name: "Events" },
  ],
  employeeGroups: [
    { id: "front-of-house", name: "Front of house", color: "sky" },
    { id: "bar-team", name: "Bar team", color: "emerald" },
    { id: "kitchen-team", name: "Kitchen", color: "amber" },
    { id: "management", name: "Management", color: "violet" },
  ],
  employees: [
    employee("ava", "Ava Mitchell", "front-of-house", "sky", 32),
    employee("ella", "Ella Brooks", "front-of-house", "sky", 24),
    employee("mia", "Mia Carter", "front-of-house", "sky", 28),
    employee("ruby", "Ruby Patel", "front-of-house", "sky", 20),
    employee("leo", "Leo Turner", "bar-team", "emerald", 35),
    employee("noah", "Noah Evans", "bar-team", "emerald", 30),
    employee("isla", "Isla Morgan", "bar-team", "emerald", 26),
    employee("archie", "Archie Wilson", "bar-team", "emerald", 18),
    employee("oscar", "Oscar Hughes", "kitchen-team", "amber", 40),
    employee("freya", "Freya Clarke", "kitchen-team", "amber", 32),
    employee("harry", "Harry Bennett", "kitchen-team", "amber", 30),
    employee("sienna", "Sienna Reid", "kitchen-team", "amber", 22),
    employee("amelia", "Amelia Foster", "management", "violet", 38),
    employee("jack", "Jack Thompson", "management", "violet", 38),
    employee("grace", "Grace Walker", "management", "violet", 24),
  ],
  shifts: [
    standardShift("mon-floor-open", "monday", "floor", "09:00", "15:00"),
    standardShift("mon-floor-late", "monday", "floor", "15:00", "22:30"),
    standardShift("mon-bar-late", "monday", "bar", "16:00", "23:00"),
    splitShift("mon-kitchen-split", "monday", "kitchen"),
    standardShift("mon-manager", "monday", "events", "10:00", "18:00"),

    standardShift("tue-floor-open", "tuesday", "floor", "09:00", "15:00"),
    standardShift("tue-floor-late", "tuesday", "floor", "15:00", "22:30"),
    standardShift("tue-bar-late", "tuesday", "bar", "16:00", "23:00"),
    standardShift("tue-kitchen-open", "tuesday", "kitchen", "08:00", "16:00"),
    standardShift("tue-kitchen-late", "tuesday", "kitchen", "15:00", "22:00"),

    standardShift("wed-floor-open", "wednesday", "floor", "09:00", "15:00"),
    standardShift("wed-floor-late", "wednesday", "floor", "15:00", "22:30"),
    standardShift("wed-bar-late", "wednesday", "bar", "16:00", "23:00"),
    splitShift("wed-kitchen-split", "wednesday", "kitchen"),
    standardShift("wed-manager", "wednesday", "events", "12:00", "20:00"),

    standardShift("thu-floor-open", "thursday", "floor", "09:00", "15:00"),
    standardShift("thu-floor-late", "thursday", "floor", "15:00", "22:30"),
    standardShift("thu-bar-late", "thursday", "bar", "16:00", "23:00"),
    standardShift("thu-kitchen-open", "thursday", "kitchen", "08:00", "16:00"),
    standardShift("thu-events", "thursday", "events", "17:00", "22:00"),

    standardShift("fri-floor-open", "friday", "floor", "09:00", "15:00"),
    closingShift("fri-floor-close", "friday", "floor", "16:00"),
    closingShift("fri-bar-close", "friday", "bar", "17:00"),
    standardShift("fri-kitchen-open", "friday", "kitchen", "08:00", "16:00"),
    closingShift("fri-kitchen-close", "friday", "kitchen", "15:00"),
    standardShift("fri-events", "friday", "events", "18:00", "23:30"),

    standardShift("sat-floor-open", "saturday", "floor", "09:00", "16:00"),
    closingShift("sat-floor-close", "saturday", "floor", "16:00"),
    closingShift("sat-bar-close", "saturday", "bar", "16:30"),
    standardShift("sat-kitchen-open", "saturday", "kitchen", "08:00", "16:00"),
    closingShift("sat-kitchen-close", "saturday", "kitchen", "15:00"),
    standardShift("sat-events", "saturday", "events", "17:00", "23:30"),

    standardShift("sun-floor-open", "sunday", "floor", "10:00", "16:00"),
    standardShift("sun-floor-late", "sunday", "floor", "15:00", "21:00"),
    standardShift("sun-bar", "sunday", "bar", "13:00", "21:00"),
    standardShift("sun-kitchen", "sunday", "kitchen", "09:00", "18:00"),
  ],
  assignments: [
    assignment("a1", "ava", "mon-floor-open"),
    assignment("a2", "mia", "mon-floor-late"),
    assignment("a3", "leo", "mon-bar-late"),
    assignment("a4", "oscar", "mon-kitchen-split"),
    assignment("a5", "amelia", "mon-manager"),

    assignment("a6", "ella", "tue-floor-open"),
    assignment("a7", "ruby", "tue-floor-late"),
    assignment("a8", "noah", "tue-bar-late"),
    assignment("a9", "freya", "tue-kitchen-open"),
    assignment("a10", "harry", "tue-kitchen-late"),

    assignment("a11", "ava", "wed-floor-open"),
    assignment("a12", "mia", "wed-floor-late"),
    assignment("a13", "isla", "wed-bar-late"),
    assignment("a14", "oscar", "wed-kitchen-split"),
    assignment("a15", "jack", "wed-manager"),

    assignment("a16", "ella", "thu-floor-open"),
    assignment("a17", "ruby", "thu-floor-late"),
    assignment("a18", "leo", "thu-bar-late"),
    assignment("a19", "freya", "thu-kitchen-open"),
    assignment("a20", "grace", "thu-events"),

    assignment("a21", "ava", "fri-floor-open"),
    assignment("a22", "mia", "fri-floor-close"),
    assignment("a23", "noah", "fri-bar-close"),
    assignment("a24", "archie", "fri-bar-close"),
    assignment("a25", "harry", "fri-kitchen-open"),
    assignment("a26", "oscar", "fri-kitchen-close"),
    assignment("a27", "amelia", "fri-events"),

    assignment("a28", "ella", "sat-floor-open"),
    assignment("a29", "ruby", "sat-floor-close"),
    assignment("a30", "leo", "sat-bar-close"),
    assignment("a31", "isla", "sat-bar-close"),
    assignment("a32", "freya", "sat-kitchen-open"),
    assignment("a33", "sienna", "sat-kitchen-close"),
    assignment("a34", "jack", "sat-events"),

    assignment("a35", "ava", "sun-floor-open"),
    assignment("a36", "ella", "sun-floor-late"),
    assignment("a37", "archie", "sun-bar"),
    assignment("a38", "harry", "sun-kitchen"),
  ],
  templates: [
    {
      id: "demo-template-busy-weekend",
      name: "Busy weekend",
      description: "Extra bar and events cover for high-demand weekends.",
      shiftCount: 18,
    },
  ],
} satisfies WorkspaceBoardData

function employee(
  id: string,
  name: string,
  groupId: WorkspaceBoardData["employees"][number]["groupId"],
  groupColor: WorkspaceBoardData["employees"][number]["groupColor"],
  weeklyHours: number
) {
  return {
    id,
    name,
    groupId,
    groupColor,
    weeklyHours,
    compensation:
      groupId === "management"
        ? { type: "salary" as const, weeklySalaryPence: 85000 }
        : {
            type: "hourly" as const,
            hourlyRatePence: DEFAULT_MINIMUM_WAGE_PENCE,
          },
  }
}

function standardShift(
  id: string,
  dayId: string,
  zoneId: string,
  startTime: string,
  endTime: string
): WorkspaceStandardShift {
  return {
    id,
    dayId,
    zoneId,
    shiftType: "standard",
    startTime,
    endTime,
  }
}

function closingShift(
  id: string,
  dayId: string,
  zoneId: string,
  startTime: string
): WorkspaceClosingShift {
  return {
    id,
    dayId,
    zoneId,
    shiftType: "closing",
    startTime,
    endKind: "locationClose",
  }
}

function splitShift(
  id: string,
  dayId: string,
  zoneId: string
): WorkspaceSplitShift {
  return {
    id,
    dayId,
    zoneId,
    shiftType: "split",
    segments: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "17:00", endTime: "21:30" },
    ],
  }
}

function assignment(id: string, employeeId: string, shiftId: string) {
  return {
    id,
    employeeId,
    shiftId,
  }
}

export { demoRotaBoardData }

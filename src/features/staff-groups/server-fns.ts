import { createServerFn } from "@tanstack/react-start"

import {
  assignEmployeeStaffGroupInputSchema,
  bulkAssignEmployeeStaffGroupInputSchema,
  bulkSetEmployeeCompensationInputSchema,
  createStaffGroupInputSchema,
  deleteStaffGroupInputSchema,
  getStaffGroupSettingsInputSchema,
  removeEmployeeFromWorkspaceInputSchema,
  renameStaffGroupInputSchema,
  setEmployeeActiveInputSchema,
  setEmployeeCompensationInputSchema,
  setStaffGroupColorInputSchema,
} from "@/features/staff-groups/schemas/staff-group-schemas"

const getStaffGroupSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getStaffGroupSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/queries")
    return module.getStaffGroupSettingsPageData(data)
  })

const createStaffGroup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createStaffGroupInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.createStaffGroup(data)
  })

const renameStaffGroup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => renameStaffGroupInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.renameStaffGroup(data)
  })

const setStaffGroupColor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    setStaffGroupColorInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.setStaffGroupColor(data)
  })

const deleteStaffGroup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteStaffGroupInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.deleteStaffGroup(data)
  })

const assignEmployeeStaffGroup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    assignEmployeeStaffGroupInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.assignEmployeeStaffGroup(data)
  })

const bulkAssignEmployeeStaffGroup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    bulkAssignEmployeeStaffGroupInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.bulkAssignEmployeeStaffGroup(data)
  })

const setEmployeeActiveStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => setEmployeeActiveInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.setEmployeeActiveStatus(data)
  })

const setEmployeeCompensation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    setEmployeeCompensationInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.setEmployeeCompensation(data)
  })

const bulkSetEmployeeCompensation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    bulkSetEmployeeCompensationInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.bulkSetEmployeeCompensation(data)
  })

const removeEmployeeFromWorkspace = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    removeEmployeeFromWorkspaceInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/staff-groups/server/actions")
    return module.removeEmployeeFromWorkspace(data)
  })

export {
  assignEmployeeStaffGroup,
  bulkAssignEmployeeStaffGroup,
  bulkSetEmployeeCompensation,
  createStaffGroup,
  deleteStaffGroup,
  getStaffGroupSettingsPageData,
  renameStaffGroup,
  removeEmployeeFromWorkspace,
  setEmployeeActiveStatus,
  setEmployeeCompensation,
  setStaffGroupColor,
}

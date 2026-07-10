"use client"

import * as React from "react"

import type {
  CompanyEmployeeNoteLocationOption,
  CompanyEmployeeNoteZoneOption,
  CompanyEmployeeRotaNote,
  CompanyEmployeeRotaNoteFormValues,
} from "@/features/company/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  employeeRotaNoteCategories,
  employeeRotaNoteCategoryLabels,
  employeeRotaNotePriorities,
  employeeRotaNotePriorityLabels,
} from "@/features/company/constants/rota-notes"

type CompanyEmployeeRotaNoteDialogProps = {
  locations: CompanyEmployeeNoteLocationOption[]
  note?: CompanyEmployeeRotaNote | null
  open: boolean
  pending: boolean
  zones: CompanyEmployeeNoteZoneOption[]
  onOpenChange: (open: boolean) => void
  onSave: (note: CompanyEmployeeRotaNoteFormValues) => Promise<void>
}

const emptyValues: CompanyEmployeeRotaNoteFormValues = {
  body: "",
  category: "general",
  isPinned: false,
  locationId: null,
  priority: "normal",
  title: "",
  zoneId: null,
}

function CompanyEmployeeRotaNoteDialog({
  locations,
  note,
  open,
  pending,
  zones,
  onOpenChange,
  onSave,
}: CompanyEmployeeRotaNoteDialogProps) {
  const [values, setValues] =
    React.useState<CompanyEmployeeRotaNoteFormValues>(emptyValues)
  const filteredZones = values.locationId
    ? zones.filter((zone) => zone.locationId === values.locationId)
    : zones

  React.useEffect(() => {
    if (!open) return

    setValues(
      note
        ? {
            body: note.body,
            category: note.category,
            isPinned: note.isPinned,
            locationId: note.locationId,
            priority: note.priority,
            title: note.title,
            zoneId: note.zoneId,
          }
        : emptyValues
    )
  }, [note, open])

  const canSave =
    values.title.trim().length >= 2 && values.body.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-lg">
        <DialogHeader className="p-5 pb-4">
          <DialogTitle>{note ? "Edit rota note" : "Add rota note"}</DialogTitle>
          <DialogDescription>
            Keep useful scheduling guidance attached to this employee.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 pb-5">
          <Field label="Title">
            <Input
              value={values.title}
              disabled={pending}
              maxLength={80}
              placeholder="e.g. Can open"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Note">
            <Textarea
              value={values.body}
              disabled={pending}
              maxLength={1000}
              rows={4}
              placeholder="Add the detail rota managers should know."
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category">
              <NativeSelect
                value={values.category}
                disabled={pending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    category: event.target.value as typeof values.category,
                  }))
                }
              >
                {employeeRotaNoteCategories.map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {employeeRotaNoteCategoryLabels[category]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Priority">
              <NativeSelect
                value={values.priority}
                disabled={pending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    priority: event.target.value as typeof values.priority,
                  }))
                }
              >
                {employeeRotaNotePriorities.map((priority) => (
                  <NativeSelectOption key={priority} value={priority}>
                    {employeeRotaNotePriorityLabels[priority]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Location scope">
              <NativeSelect
                value={values.locationId ?? "all"}
                disabled={pending}
                onChange={(event) => {
                  const locationId =
                    event.target.value === "all" ? null : event.target.value
                  setValues((current) => ({
                    ...current,
                    locationId,
                    zoneId: null,
                  }))
                }}
              >
                <NativeSelectOption value="all">All locations</NativeSelectOption>
                {locations.map((location) => (
                  <NativeSelectOption key={location.id} value={location.id}>
                    {location.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Zone scope">
              <NativeSelect
                value={values.zoneId ?? "all"}
                disabled={pending || filteredZones.length === 0}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    zoneId:
                      event.target.value === "all" ? null : event.target.value,
                  }))
                }
              >
                <NativeSelectOption value="all">No zone scope</NativeSelectOption>
                {filteredZones.map((zone) => (
                  <NativeSelectOption key={zone.id} value={zone.id}>
                    {zone.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-[#f5f8ff] px-3 py-2 text-sm font-semibold text-[#33477d]">
            Pin this note above others
            <Switch
              checked={values.isPinned}
              disabled={pending}
              onCheckedChange={(checked) =>
                setValues((current) => ({ ...current, isPinned: checked }))
              }
            />
          </label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending || !canSave}
            onClick={() => {
              const nextValues = {
                ...values,
                body: values.body.trim(),
                title: values.title.trim(),
              }
              void onSave(nextValues).then(() => onOpenChange(false))
            }}
          >
            {pending ? "Saving..." : "Save note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-[#33477d]">
      <span>{label}</span>
      {children}
    </label>
  )
}

export { CompanyEmployeeRotaNoteDialog }

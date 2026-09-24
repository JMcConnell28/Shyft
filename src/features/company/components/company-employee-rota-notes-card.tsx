"use client"

import * as React from "react"
import { PencilIcon, PinIcon, PlusIcon, StickyNoteIcon } from "lucide-react"

import type {
  CompanyEmployeeDetail,
  CompanyEmployeeRotaNote,
  CompanyEmployeeRotaNoteFormValues,
} from "@/features/company/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CompanyEmployeeRotaNoteDialog } from "@/features/company/components/company-employee-rota-note-dialog"
import { SettingsSection } from "@/features/settings/components/settings-section"
import {
  employeeRotaNoteCategoryLabels,
  employeeRotaNotePriorityLabels,
} from "@/features/company/constants/rota-notes"

type CompanyEmployeeRotaNotesCardProps = {
  employee: CompanyEmployeeDetail
  pending: boolean
  onArchive: (noteId: string) => Promise<void>
  onCreate: (note: CompanyEmployeeRotaNoteFormValues) => Promise<void>
  onUpdate: (
    noteId: string,
    note: CompanyEmployeeRotaNoteFormValues
  ) => Promise<void>
}

function CompanyEmployeeRotaNotesCard({
  employee,
  pending,
  onArchive,
  onCreate,
  onUpdate,
}: CompanyEmployeeRotaNotesCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingNote, setEditingNote] =
    React.useState<CompanyEmployeeRotaNote | null>(null)

  return (
    <SettingsSection
      icon={StickyNoteIcon}
      title="Rota notes"
      description="Store guidance managers can use when building shifts."
    >
      <div className="flex justify-end py-3">
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-semibold"
          disabled={pending}
          onClick={() => {
            setEditingNote(null)
            setDialogOpen(true)
          }}
        >
          <PlusIcon className="size-3.5" />
          Add note
        </Button>
      </div>

      {employee.rotaNotes.length === 0 ? (
        <p className="py-4 text-xs text-[#61709a]">No rota notes yet.</p>
      ) : (
        employee.rotaNotes.map((note) => (
          <RotaNoteItem
            key={note.id}
            note={note}
            pending={pending}
            onArchive={() => onArchive(note.id)}
            onEdit={() => {
              setEditingNote(note)
              setDialogOpen(true)
            }}
          />
        ))
      )}

      <CompanyEmployeeRotaNoteDialog
        locations={employee.rotaNoteLocations}
        note={editingNote}
        open={dialogOpen}
        pending={pending}
        zones={employee.rotaNoteZones}
        onOpenChange={setDialogOpen}
        onSave={(note) =>
          editingNote ? onUpdate(editingNote.id, note) : onCreate(note)
        }
      />
    </SettingsSection>
  )
}

function RotaNoteItem({
  note,
  pending,
  onArchive,
  onEdit,
}: {
  note: CompanyEmployeeRotaNote
  pending: boolean
  onArchive: () => Promise<void>
  onEdit: () => void
}) {
  return (
    <article className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-bold">{note.title}</h4>
            {note.isPinned ? (
              <Badge
                variant="secondary"
                className="bg-[#eef3ff] text-[#0069ff]"
              >
                <PinIcon className="size-3" />
                Pinned
              </Badge>
            ) : null}
            <Badge variant="outline">
              {employeeRotaNoteCategoryLabels[note.category]}
            </Badge>
            {note.priority === "high" ? (
              <Badge variant="destructive">
                {employeeRotaNotePriorityLabels[note.priority]}
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-5 whitespace-pre-wrap text-[#33477d]">
            {note.body}
          </p>
          <p className="mt-2 text-[11px] text-[#61709a]">
            {getNoteScopeLabel(note)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8 rounded-lg"
            disabled={pending}
            onClick={onEdit}
            aria-label="Edit rota note"
          >
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-lg px-3 text-xs font-extrabold"
            disabled={pending}
            onClick={() => void onArchive()}
          >
            Archive
          </Button>
        </div>
      </div>
    </article>
  )
}

function getNoteScopeLabel(note: CompanyEmployeeRotaNote) {
  if (note.zoneName && note.locationName) {
    return `${note.locationName} - ${note.zoneName}`
  }

  if (note.zoneName) {
    return note.zoneName
  }

  if (note.locationName) {
    return note.locationName
  }

  return "All locations"
}

export { CompanyEmployeeRotaNotesCard }

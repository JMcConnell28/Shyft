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
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
            <StickyNoteIcon className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-[-0.03em]">
              Rota notes
            </h3>
            <p className="mt-1 text-sm font-semibold text-[#61709a]">
              Store guidance managers can use when building shifts.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-extrabold"
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

      <div className="mt-4 space-y-3">
        {employee.rotaNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#dce3f1] p-4 text-sm font-semibold text-[#61709a]">
            No rota notes yet.
          </div>
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
      </div>

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
    </section>
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
    <article className="rounded-xl border border-[#edf0f6] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-extrabold">{note.title}</h4>
            {note.isPinned ? (
              <Badge variant="secondary" className="bg-[#eef3ff] text-[#0069ff]">
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
          <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-[#33477d]">
            {note.body}
          </p>
          <p className="mt-2 text-xs font-semibold text-[#61709a]">
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

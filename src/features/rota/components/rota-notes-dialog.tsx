"use client"

import * as React from "react"
import { CircleDotIcon, LoaderCircleIcon, NotepadTextIcon, PlusIcon } from "lucide-react"

import { buildNotePromptTemplate, rotaNotePrompts } from "@/features/rota/constants/note-prompts"
import { useUpdateRotaNote } from "@/features/rota/hooks/use-update-rota-note"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { showSuccessToast } from "@/lib/toast"

const MAX_NOTE_LENGTH = 500

function RotaNotesDialog({ mode = "default" }: { mode?: "default" | "demo" }) {
  return mode === "demo" ? <DemoRotaNotesDialog /> : <ConnectedRotaNotesDialog />
}

function ConnectedRotaNotesDialog() {
  const { meta } = useRotaWorkspace()
  const { isSaving, saveNote } = useUpdateRotaNote()

  return (
    <RotaNotesDialogContent
      isSaving={isSaving}
      metaNote={meta.note}
      onSave={saveNote}
    />
  )
}

function DemoRotaNotesDialog() {
  const { meta, setMetaNote } = useRotaWorkspace()

  async function saveDemoNote(note: string) {
    setMetaNote(note.trim() || null)
    showSuccessToast("Demo notes updated.")
  }

  return (
    <RotaNotesDialogContent
      isSaving={false}
      metaNote={meta.note}
      onSave={saveDemoNote}
    />
  )
}

function RotaNotesDialogContent({
  isSaving,
  metaNote,
  onSave,
}: {
  isSaving: boolean
  metaNote: string | null
  onSave: (note: string) => Promise<unknown>
}) {
  const [open, setOpen] = React.useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false)
  const [draftNote, setDraftNote] = React.useState(metaNote ?? "")
  const [customHeader, setCustomHeader] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      setDraftNote(metaNote ?? "")
      setCustomHeader("")
    }
  }, [metaNote, open])

  const hasSavedNote = Boolean(metaNote?.trim())
  const hasUnsavedChanges = draftNote !== (metaNote ?? "")
  const remainingCharacters = MAX_NOTE_LENGTH - draftNote.length

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && hasUnsavedChanges && !isSaving) {
      setShowDiscardDialog(true)
      return
    }

    setOpen(nextOpen)
  }

  function insertPrompt(label: string) {
    const template = buildNotePromptTemplate(label)

    setDraftNote((current) => {
      if (current.includes(`${label}\n`)) {
        return current
      }

      const trimmed = current.trimEnd()
      return trimmed ? `${trimmed}\n\n${template}` : template
    })
  }

  function handleAddCustomHeader() {
    const normalizedHeader = customHeader.trim()

    if (!normalizedHeader) {
      return
    }

    insertPrompt(normalizedHeader)
    setCustomHeader("")
  }

  async function handleSave() {
    await onSave(draftNote)
    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button
              variant="pill"
              size="icon"
              aria-label="Staff notes"
              className={cn(
                "md:h-7 md:w-auto md:gap-2 md:px-2",
                hasSavedNote
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : undefined,
              )}
            />
          }
        >
          <NotepadTextIcon data-icon="inline-start" />
          <span className="hidden md:inline">Notes</span>
          {hasSavedNote ? <CircleDotIcon className="size-3.5 fill-current" /> : null}
        </DialogTrigger>
        <DialogContent className="max-w-xl gap-5 p-0">
          <div className="space-y-5 p-4">
            <DialogHeader>
              <DialogTitle>Staff notes</DialogTitle>
              <DialogDescription>
                Add one weekly note for staff. These notes appear on the published
                rota view for employees.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              {rotaNotePrompts.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="pill"
                  size="sm"
                  onClick={() => insertPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={customHeader}
                onChange={(event) => setCustomHeader(event.target.value)}
                placeholder="Custom header"
                maxLength={40}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleAddCustomHeader()
                  }
                }}
              />
              <Button
                type="button"
                variant="pill"
                disabled={!customHeader.trim()}
                onClick={handleAddCustomHeader}
              >
                <PlusIcon data-icon="inline-start" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              <Textarea
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                maxLength={MAX_NOTE_LENGTH}
                placeholder={"Opening\n- Keyholder starts at 8am\n\nEntertainment\n- Live music from 9pm"}
                className="min-h-56 text-sm md:text-sm"
              />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Keep it concise and useful for the week ahead.</span>
                <span
                  className={cn(
                    remainingCharacters <= 60 ? "text-foreground" : undefined,
                  )}
                >
                  {draftNote.length}/{MAX_NOTE_LENGTH}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSaving || !hasUnsavedChanges}
              onClick={() => {
                void handleSave()
              }}
            >
              {isSaving ? (
                <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
              ) : null}
              Save notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard note changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved staff note edits. Closing now will lose those changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDraftNote(metaNote ?? "")
                setShowDiscardDialog(false)
                setOpen(false)
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default RotaNotesDialog

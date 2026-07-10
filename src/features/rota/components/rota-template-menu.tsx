"use client"

import * as React from "react"
import {
  ChevronDown,
  LoaderCircleIcon,
  SaveIcon,
  ShapesIcon,
} from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { RotaTemplateSummary } from "@/features/rota/types"
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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaToolbarButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import {
  applyRotaTemplateToRota,
  createRotaTemplateFromRota,
  overrideRotaTemplateFromRota,
} from "@/features/rota/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

type SaveCurrentRota = (options?: {
  bypassRateLimit?: boolean
}) => Promise<void>

function RotaTemplateMenu({
  isSaving,
  saveCurrentRota,
}: {
  isSaving: boolean
  saveCurrentRota: SaveCurrentRota
}) {
  const queryClient = useQueryClient()
  const createTemplateFn = useServerFn(createRotaTemplateFromRota)
  const overrideTemplateFn = useServerFn(overrideRotaTemplateFromRota)
  const applyTemplateFn = useServerFn(applyRotaTemplateToRota)
  const { assignmentsById, meta, shiftsById, templates } = useRotaWorkspace()
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false)
  const [pendingApplyTemplate, setPendingApplyTemplate] =
    React.useState<RotaTemplateSummary | null>(null)
  const hasBoardContents =
    Object.keys(shiftsById).length > 0 ||
    Object.keys(assignmentsById).length > 0

  async function invalidateRota() {
    await queryClient.invalidateQueries({
      queryKey: rotaQueryKeys.all,
    })
  }

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      await saveCurrentRota({ bypassRateLimit: true })
      return createTemplateFn({
        data: {
          rotaId: meta.rotaId,
          name,
        },
      })
    },
    onSuccess: async () => {
      await invalidateRota()
      showSuccessToast("Template saved.")
      setSaveDialogOpen(false)
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not save that template.",
      })
    },
  })

  const overrideMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await saveCurrentRota({ bypassRateLimit: true })
      return overrideTemplateFn({
        data: {
          rotaId: meta.rotaId,
          templateId,
        },
      })
    },
    onSuccess: async () => {
      await invalidateRota()
      showSuccessToast("Template updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that template.",
      })
    },
  })

  const applyMutation = useMutation({
    mutationFn: (templateId: string) =>
      applyTemplateFn({
        data: {
          rotaId: meta.rotaId,
          templateId,
        },
      }),
    onSuccess: async (result) => {
      await invalidateRota()
      setPendingApplyTemplate(null)
      showSuccessToast(
        result.shiftCount === 1
          ? "Template applied with 1 shift."
          : `Template applied with ${result.shiftCount} shifts.`
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not apply that template.",
      })
    },
  })

  const isBusy =
    isSaving ||
    createMutation.isPending ||
    overrideMutation.isPending ||
    applyMutation.isPending

  function handleApply(template: RotaTemplateSummary) {
    if (hasBoardContents) {
      setPendingApplyTemplate(template)
      return
    }

    applyMutation.mutate(template.id)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="pill"
              size="icon"
              aria-label="Templates"
              disabled={isBusy}
              className={rotaToolbarButtonClassName}
            />
          }
        >
          {isBusy ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" />
          ) : (
            <ShapesIcon className="size-3.5" />
          )}
          <span className="hidden group-data-[toolbar-more=true]/toolbar-more:inline md:inline">
            Templates
          </span>
          <ChevronDown className="hidden size-3.5 md:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem
            onClick={() => {
              setSaveDialogOpen(true)
            }}
          >
            <SaveIcon className="size-3.5" />
            Save as template
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Apply template</DropdownMenuLabel>
            {templates.length === 0 ? (
              <DropdownMenuItem disabled>No saved templates</DropdownMenuItem>
            ) : (
              templates.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => {
                    handleApply(template)
                  }}
                >
                  {template.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>

          {templates.length > 0 ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Override template
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  {templates.map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => {
                        overrideMutation.mutate(template.id)
                      }}
                    >
                      {template.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <SaveTemplateDialog
        open={saveDialogOpen}
        pending={createMutation.isPending || isSaving}
        onOpenChange={setSaveDialogOpen}
        onSubmit={async (name) => {
          await createMutation.mutateAsync(name)
        }}
      />

      <ApplyTemplateDialog
        pending={applyMutation.isPending}
        template={pendingApplyTemplate}
        onCancel={() => setPendingApplyTemplate(null)}
        onConfirm={async (templateId) => {
          await applyMutation.mutateAsync(templateId)
        }}
      />
    </>
  )
}

function SaveTemplateDialog({
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => Promise<void>
}) {
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName("")
      setError(null)
    }
  }, [open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()

    if (!normalizedName) {
      setError("Enter a template name.")
      return
    }

    try {
      await onSubmit(normalizedName)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not save that template."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>
            Save this rota's shifts as a reusable weekly pattern. Staff
            assignments are not included.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <Field>
            <FieldLabel htmlFor="save-template-name">Template name</FieldLabel>
            <FieldContent>
              <Input
                id="save-template-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Standard week"
                maxLength={80}
                autoFocus
              />
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ApplyTemplateDialog({
  pending,
  template,
  onCancel,
  onConfirm,
}: {
  pending: boolean
  template: RotaTemplateSummary | null
  onCancel: () => void
  onConfirm: (templateId: string) => Promise<void>
}) {
  return (
    <AlertDialog open={Boolean(template)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Apply {template?.name ?? "template"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will replace the current rota shifts and remove any staff
            assignments on this rota.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || !template}
            onClick={() => {
              if (template) {
                void onConfirm(template.id)
              }
            }}
          >
            {pending ? "Applying..." : "Apply template"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { RotaTemplateMenu }

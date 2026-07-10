"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import {
  getStaffGroupColorAppearance,
  staffGroupColorOptions,
  type StaffGroupColor,
} from "@/features/staff-groups/constants/staff-group-colors"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function StaffGroupDialog({
  title,
  description,
  triggerLabel,
  defaultName = "",
  defaultColor = "slate",
  pending = false,
  submitLabel,
  onSubmit,
}: {
  title: string
  description: string
  triggerLabel: React.ReactNode
  defaultName?: string
  defaultColor?: StaffGroupColor
  pending?: boolean
  submitLabel: string
  onSubmit: (values: { name: string; color: StaffGroupColor }) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(defaultName)
  const [color, setColor] = React.useState<StaffGroupColor>(defaultColor)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName(defaultName)
      setColor(defaultColor)
      setError(null)
    }
  }, [defaultColor, defaultName, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()

    if (normalizedName.length < 2) {
      setError("Enter a group name.")
      return
    }

    try {
      await onSubmit({
        name: normalizedName,
        color,
      })
      setOpen(false)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not save that group.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="pill" size="sm" className="gap-2" />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <Field>
            <FieldLabel htmlFor="staff-group-name">Group name</FieldLabel>
            <FieldContent>
              <Input
                id="staff-group-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Bar staff"
                maxLength={15}
                autoFocus
              />
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>
          <Field className="mt-4">
            <FieldLabel>Color</FieldLabel>
            <FieldContent>
              <div className="flex flex-wrap gap-2">
                {staffGroupColorOptions.map((option) => {
                  const appearance = getStaffGroupColorAppearance(option)
                  const isSelected = color === option

                  return (
                    <Button
                      key={option}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        appearance.buttonClassName,
                        isSelected
                          ? "ring-2 ring-foreground/20 ring-offset-1"
                          : "opacity-80 hover:opacity-100",
                      )}
                      aria-pressed={isSelected}
                      onClick={() => setColor(option)}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${appearance.swatchClassName}`}
                      />
                      {appearance.label}
                      {isSelected ? (
                        <CheckIcon
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                      ) : null}
                    </Button>
                  )
                })}
              </div>
            </FieldContent>
          </Field>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { StaffGroupDialog }

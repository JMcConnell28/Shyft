"use client"

import type { ComponentType } from "react"
import { CopyPlusIcon, FileStackIcon, PlusIcon } from "lucide-react"

import type { RotaCreationPreview } from "@/features/rota/types"
import type { NewRotaSource } from "@/features/rota/schemas/rota-schemas"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const sourceOptions: Array<{
  value: NewRotaSource
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    value: "blank",
    title: "Blank rota",
    description: "Start fresh with an empty draft for the selected week.",
    icon: PlusIcon,
  },
  {
    value: "previous-week",
    title: "Copy previous week",
    description: "Reuse the latest published rota for this location as a base.",
    icon: CopyPlusIcon,
  },
  {
    value: "template",
    title: "Use template",
    description: "Start from one of your saved rota templates.",
    icon: FileStackIcon,
  },
]

function NewRotaSourcePicker({
  value,
  onChange,
  preview,
  isPreviewPending,
  error,
}: {
  value: NewRotaSource
  onChange: (value: NewRotaSource) => void
  preview: RotaCreationPreview | null
  isPreviewPending: boolean
  error?: string
}) {
  const availableTemplates = preview?.templates ?? []
  const previousPublishedLabel = preview?.previousPublished?.weekLabel ?? null

  return (
    <Field>
      <FieldLabel>Start from</FieldLabel>
      <FieldContent className="grid gap-2">
        {sourceOptions.map((option) => {
          const isDisabled =
            (option.value === "previous-week" &&
              !isPreviewPending &&
              !preview?.previousPublished) ||
            (option.value === "template" &&
              !isPreviewPending &&
              availableTemplates.length === 0)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (!isDisabled) {
                  onChange(option.value)
                }
              }}
              disabled={isDisabled}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                value === option.value
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/70 bg-background hover:bg-muted/30",
                isDisabled && "cursor-not-allowed opacity-50",
              )}
            >
              <div className="mt-0.5 rounded-lg bg-muted p-2">
                <option.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{option.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {option.description}
                </div>
                {option.value === "previous-week" && previousPublishedLabel ? (
                  <div className="mt-2 text-[11px] font-medium text-foreground/70">
                    Source: {previousPublishedLabel}
                  </div>
                ) : null}
              </div>
            </button>
          )
        })}
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { NewRotaSourcePicker }

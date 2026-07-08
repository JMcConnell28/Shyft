"use client"

import {
  CheckCircle2Icon,
  CopyPlusIcon,
  FileIcon,
  LayoutGridIcon,
} from "lucide-react"
import type { ComponentType } from "react"

import type { NewRotaSource } from "@/features/rota/schemas/rota-schemas"
import type { RotaCreationPreview } from "@/features/rota/types"
import { cn } from "@/lib/utils"

type SourceOption = {
  value: NewRotaSource
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  tone: string
}

const sourceOptions: Array<SourceOption> = [
  {
    value: "blank",
    title: "Blank rota",
    description: "Start fresh",
    icon: FileIcon,
    tone: "bg-[#eaf0ff] text-[#0069ff]",
  },
  {
    value: "previous-week",
    title: "Copy last week",
    description: "Use latest published",
    icon: CopyPlusIcon,
    tone: "bg-[#e1f8eb] text-[#00a84f]",
  },
  {
    value: "template",
    title: "Use template",
    description: "Apply a saved pattern",
    icon: LayoutGridIcon,
    tone: "bg-[#f2e6ff] text-[#8d48ec]",
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

  return (
    <section>
      <h3 className="text-xs font-semibold text-[#7a86a4]">Start with</h3>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {sourceOptions.map((option) => {
          const isDisabled =
            (option.value === "previous-week" &&
              !isPreviewPending &&
              !preview?.previousPublished) ||
            (option.value === "template" &&
              !isPreviewPending &&
              availableTemplates.length === 0)
          const isSelected = value === option.value
          const Icon = option.icon

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
                "relative flex min-h-[4.25rem] w-full items-center gap-2 rounded-[10px] border bg-[#fbfcff] px-2.5 text-left transition-colors hover:border-[#b8c3d9] hover:bg-white",
                isSelected
                  ? "border-[#0069ff] bg-white text-[#11245a] ring-1 ring-[#0069ff]"
                  : "border-[#dfe5f0] text-[#11245a]",
                isDisabled && "cursor-not-allowed opacity-45"
              )}
            >
              {isSelected ? (
                <CheckCircle2Icon className="absolute top-1.5 right-1.5 size-3.5 fill-[#0069ff] text-white" />
              ) : null}
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-[9px]",
                  option.tone
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs leading-tight font-bold">
                  {option.title}
                </span>
                <span className="mt-1 block truncate text-[10px] leading-none font-medium text-[#7a86a4]">
                  {option.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {error ? (
        <p className="mt-1.5 px-1 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  )
}

export { NewRotaSourcePicker }

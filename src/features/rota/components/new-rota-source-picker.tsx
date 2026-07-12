"use client"

import type { NewRotaSource } from "@/features/rota/schemas/rota-schemas"
import type { RotaCreationPreview } from "@/features/rota/types"
import { cn } from "@/lib/utils"

type SourceOption = {
  value: NewRotaSource
  title: string
  description: string
}

const sourceOptions: Array<SourceOption> = [
  {
    value: "blank",
    title: "Blank rota",
    description: "Start from scratch",
  },
  {
    value: "template",
    title: "Use a template",
    description: "Apply saved shift templates",
  },
  {
    value: "previous-week",
    title: "Copy last week",
    description: "Duplicate the latest published rota",
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
      <h3 className="text-sm font-medium text-[#10285c]">Start with</h3>
      <div
        role="radiogroup"
        aria-label="Rota starting point"
        className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {sourceOptions.map((option) => {
          const isDisabled =
            (option.value === "previous-week" &&
              !isPreviewPending &&
              !preview?.previousPublished) ||
            (option.value === "template" &&
              !isPreviewPending &&
              availableTemplates.length === 0)
          const isSelected = value === option.value
          const description =
            option.value === "previous-week" && preview?.previousPublished
              ? `Duplicate ${preview.previousPublished.weekLabel}`
              : option.description

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  onChange(option.value)
                }
              }}
              className={cn(
                "flex min-h-[3.65rem] w-full items-center gap-3 rounded-xl border bg-white px-4 text-left transition-colors hover:border-[#b8c3d9] sm:min-h-[4.25rem] sm:gap-2 sm:rounded-[10px] sm:bg-[#fbfcff] sm:px-2.5",
                isSelected
                  ? "border-[#0868f7] bg-[#f8fbff] text-[#10285c] ring-1 ring-[#0868f7]"
                  : "border-[#d7e0ed] text-[#10285c]",
                isDisabled && "cursor-not-allowed opacity-45"
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected
                    ? "border-[#0868f7] bg-[#0868f7]"
                    : "border-[#71809b] bg-white"
                )}
              >
                {isSelected ? (
                  <span className="size-2 rounded-full bg-white" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm leading-tight font-semibold sm:text-xs sm:font-bold">
                  {option.title}
                </span>
                <span className="mt-1 block truncate text-xs leading-none font-medium text-[#607399] sm:text-[10px]">
                  {description}
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

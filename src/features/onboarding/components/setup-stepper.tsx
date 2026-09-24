import { cn } from "@/lib/utils"

function SetupStepper({
  activeIndex,
  labels,
}: {
  activeIndex: number
  labels: ReadonlyArray<string>
}) {
  return (
    <nav
      aria-label="Setup progress"
      className={cn(
        "mx-auto mb-3 w-full",
        labels.length === 2 ? "max-w-[250px]" : "max-w-[440px]"
      )}
    >
      <ol className="flex items-start justify-between gap-1">
        {labels.map((label, index) => (
          <li
            key={label}
            className="flex min-w-0 flex-1 items-start last:flex-none"
          >
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                aria-current={index === activeIndex ? "step" : undefined}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full bg-[#edf2f9] text-xs font-bold text-[#697899] transition-[background-color,color,transform] duration-300 sm:size-9 sm:text-sm",
                  index <= activeIndex && "bg-[#1165ed] text-white",
                  index === activeIndex &&
                    "scale-110 shadow-[0_6px_16px_rgba(17,101,237,0.2)]"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-center text-[11px] font-semibold text-[#687799] sm:text-xs",
                  index === activeIndex && "text-[#075fe6]"
                )}
              >
                {label}
              </span>
            </div>
            {index < labels.length - 1 ? (
              <span
                aria-hidden="true"
                className="mx-2 mt-4 h-px min-w-2 flex-1 bg-[#cbd8ec] sm:mx-3 sm:mt-[18px]"
              >
                <span
                  className={cn(
                    "block h-px bg-[#1165ed] transition-[width] duration-300",
                    index < activeIndex ? "w-full" : "w-0"
                  )}
                />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export { SetupStepper }

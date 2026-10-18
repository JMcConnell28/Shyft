import { useEffect, useId, useState } from "react"
import { Input } from "@/components/ui/input"
import { formatMinuteOption } from "@/features/time-clock/constants/clock-settings-options"

function ClockDurationInput({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (minutes: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  const [error, setError] = useState<string | null>(null)
  const descriptionId = useId()
  useEffect(() => {
    setDraft(String(value))
    setError(null)
  }, [value])

  function commit() {
    const minutes = Number(draft)
    if (
      !draft.trim() ||
      !Number.isInteger(minutes) ||
      minutes < min ||
      minutes > max
    ) {
      setError(`Enter ${min}–${max} whole minutes.`)
      return
    }
    setError(null)
    if (minutes !== value) onChange(minutes)
  }

  return (
    <div className="w-32 text-right sm:w-36">
      <div className="flex items-center gap-1.5">
        <Input
          aria-label={label}
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          className="h-8 bg-white text-right text-xs"
          type="number"
          inputMode="numeric"
          step={1}
          min={min}
          max={max}
          disabled={disabled}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setError(null)
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              event.currentTarget.blur()
            }
            if (event.key === "Escape") {
              setDraft(String(value))
              setError(null)
            }
          }}
        />
        <span className="text-xs text-muted-foreground">min</span>
      </div>
      <p
        id={descriptionId}
        className="mt-1 text-[10px] text-muted-foreground"
        role={error ? "alert" : undefined}
      >
        {error ?? formatMinuteOption(value)}
      </p>
    </div>
  )
}

export { ClockDurationInput }

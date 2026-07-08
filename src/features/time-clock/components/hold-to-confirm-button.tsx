"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const HOLD_DURATION_MS = 1000

type HoldToConfirmButtonProps = {
  className?: string
  disabled?: boolean
  isPending?: boolean
  label: string
  onConfirm: () => void
  subLabel?: string
}

function HoldToConfirmButton({
  className,
  disabled = false,
  isPending = false,
  label,
  onConfirm,
  subLabel,
}: HoldToConfirmButtonProps) {
  const [progress, setProgress] = React.useState(0)
  const frameRef = React.useRef<number | null>(null)
  const resetTimeoutRef = React.useRef<number | null>(null)
  const startedAtRef = React.useRef<number | null>(null)
  const completedRef = React.useRef(false)

  const clearFrame = React.useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const clearResetTimeout = React.useCallback(() => {
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
  }, [])

  const reset = React.useCallback(() => {
    clearFrame()
    clearResetTimeout()
    completedRef.current = false
    startedAtRef.current = null
    setProgress(0)
  }, [clearFrame, clearResetTimeout])

  const tick = React.useCallback(
    (time: number) => {
      if (startedAtRef.current === null) {
        return
      }

      const nextProgress = Math.min(
        (time - startedAtRef.current) / HOLD_DURATION_MS,
        1
      )
      setProgress(nextProgress)

      if (nextProgress >= 1) {
        clearFrame()
        completedRef.current = true
        startedAtRef.current = null
        onConfirm()
        resetTimeoutRef.current = window.setTimeout(() => {
          resetTimeoutRef.current = null
          setProgress(0)
        }, 120)
        return
      }

      frameRef.current = window.requestAnimationFrame(tick)
    },
    [clearFrame, onConfirm]
  )

  const start = React.useCallback(() => {
    if (disabled || isPending || startedAtRef.current !== null) {
      return
    }

    completedRef.current = false
    startedAtRef.current = window.performance.now()
    setProgress(0)
    frameRef.current = window.requestAnimationFrame(tick)
  }, [disabled, isPending, tick])

  const cancel = React.useCallback(() => {
    if (completedRef.current) {
      return
    }

    reset()
  }, [reset])

  React.useEffect(
    () => () => {
      clearFrame()
      clearResetTimeout()
      startedAtRef.current = null
      completedRef.current = false
    },
    [clearFrame, clearResetTimeout]
  )

  React.useEffect(() => {
    if (disabled || isPending) {
      reset()
    }
  }, [disabled, isPending, reset])

  return (
    <Button
      type="button"
      size="lg"
      className={cn(
        "relative touch-none overflow-hidden rounded-2xl text-base",
        className
      )}
      disabled={disabled || isPending}
      aria-label={label}
      onBlur={cancel}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && !event.repeat) {
          event.preventDefault()
          start()
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          cancel()
        }
      }}
      onPointerCancel={cancel}
      onPointerDown={start}
      onPointerLeave={cancel}
      onPointerUp={cancel}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-left bg-white/20 will-change-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isPending ? <Spinner /> : null}
        <span className="flex flex-col items-center gap-0.5">
          <span>{label}</span>
          {subLabel ? (
            <span className="text-xs font-medium opacity-80">{subLabel}</span>
          ) : null}
        </span>
      </span>
    </Button>
  )
}

export { HoldToConfirmButton }

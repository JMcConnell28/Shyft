"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  RocketIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dismissDashboardWelcome } from "@/features/dashboard/server-fns"
import {
  getDashboardWelcomeSteps,
  type WelcomeCapabilities,
} from "@/features/dashboard/components/dashboard-welcome-content"

type WelcomeWorkspace = {
  id: string
  name: string
  type: "location" | "organization"
}

function DashboardWelcomeModal({
  capabilities,
  initiallyOpen,
  userName,
  workspace,
}: {
  capabilities: WelcomeCapabilities
  initiallyOpen: boolean
  userName: string
  workspace: WelcomeWorkspace
}) {
  const [open, setOpen] = React.useState(initiallyOpen)
  const [step, setStep] = React.useState(0)
  const [isDismissing, setIsDismissing] = React.useState(false)
  const firstName = userName.trim().split(/\s+/)[0] || "there"
  const steps = getDashboardWelcomeSteps(capabilities)

  async function dismiss() {
    if (isDismissing) return

    setOpen(false)
    setIsDismissing(true)

    try {
      await dismissDashboardWelcome({
        data: { id: workspace.id, type: workspace.type },
      })
    } catch {
      setOpen(true)
      toast.error("We could not save your welcome preference.")
    } finally {
      setIsDismissing(false)
    }
  }

  const isFirstStep = step === 0
  const isLastStep = step === steps.length - 1
  const currentStep = steps[step]

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setStep(0)
          setOpen(true)
          return
        }

        if (!nextOpen) void dismiss()
      }}
    >
      {/* <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <RocketIcon />
            Welcome tour
          </Button>
        }
      /> */}
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <div className="bg-primary px-5 py-5 text-primary-foreground sm:px-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <RocketIcon className="size-5" />
          </div>
          <p className="mt-5 text-xs font-medium text-white/70">
            {workspace.name}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Welcome to RocketRota, {firstName}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
            {workspace.type === "organization"
              ? "Here is a quick look at how your organisation works in RocketRota."
              : "Here is a quick look at the tools available in this location."}
          </p>
        </div>

        <div className="min-h-56 px-5 py-5 sm:px-6">
          <DialogHeader>
            <DialogTitle>{currentStep.title}</DialogTitle>
            <DialogDescription>{currentStep.description}</DialogDescription>
          </DialogHeader>

          <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
            {currentStep.items.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="flex gap-3 py-3.5">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter className="m-0 rounded-none px-5 py-4 sm:px-6">
          <div
            className="mr-auto flex items-center gap-1.5"
            aria-label="Tutorial progress"
          >
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={
                  index === step
                    ? "h-1.5 w-5 rounded-full bg-primary transition-all"
                    : "size-1.5 rounded-full bg-border transition-all"
                }
              />
            ))}
          </div>
          {!isFirstStep ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeftIcon />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => void dismiss()}
            >
              Skip
            </Button>
          )}
          <Button
            type="button"
            disabled={isDismissing}
            onClick={() => {
              if (isLastStep) {
                void dismiss()
                return
              }

              setStep(step + 1)
            }}
          >
            {isLastStep ? (
              <>
                <CheckIcon />
                Start using RocketRota
              </>
            ) : (
              <>
                Show me around
                <ArrowRightIcon />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DashboardWelcomeModal }

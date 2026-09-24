"use client"

import * as React from "react"
import { CalendarPlus2Icon, SendIcon, UsersRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const welcomeStoragePrefix = "rocketrota:rota-welcome:v1"

function RotaWelcomeDialog({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  const storageKey = `${welcomeStoragePrefix}:${userId}:${organizationId}`
  const [openForKey, setOpenForKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) === "seen") return
    } catch {
      // The guide remains available for this visit if storage is blocked.
    }

    setOpenForKey(storageKey)
  }, [storageKey])

  function handleOpenChange(open: boolean) {
    if (open) return

    setOpenForKey(null)
    try {
      window.localStorage.setItem(storageKey, "seen")
    } catch {
      // Browsers that block storage can still dismiss the guide.
    }
  }

  return (
    <Dialog open={openForKey === storageKey} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-[#e5eaf4] bg-[#f8faff] px-5 py-5 pr-12">
          <p className="text-xs font-semibold tracking-wide text-[#5170aa] uppercase">
            Manager guide
          </p>
          <DialogTitle className="text-xl font-semibold tracking-tight text-[#11245a]">
            Your rota starts here
          </DialogTitle>
          <DialogDescription>
            Three steps from an empty week to a rota your team can see.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5">
          <GuideStep
            icon={CalendarPlus2Icon}
            number="1"
            title="Create a week"
            description="Choose New rota for a blank week, or Use template to start from a saved pattern."
          />
          <GuideStep
            icon={UsersRoundIcon}
            number="2"
            title="Build the schedule"
            description="Add shifts, assign team members, and save your work as a draft."
          />
          <GuideStep
            icon={SendIcon}
            number="3"
            title="Publish when ready"
            description="Your team sees the published rota. You can keep working on a draft until it is ready to share."
          />
        </div>

        <DialogFooter className="mx-0 mb-0 px-5">
          <DialogClose render={<Button type="button">Got it</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GuideStep({
  icon: Icon,
  number,
  title,
  description,
}: {
  icon: typeof CalendarPlus2Icon
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#edf2fc] text-[#27579f]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-semibold text-[#11245a]">
          <span className="sr-only">Step {number}: </span>
          {title}
        </p>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export { RotaWelcomeDialog }

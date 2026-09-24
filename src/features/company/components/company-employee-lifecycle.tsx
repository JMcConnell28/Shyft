"use client"

import * as React from "react"
import { UserRoundCheckIcon } from "lucide-react"

import type { CompanyEmployeeDetail } from "@/features/company/types"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SettingsSection } from "@/features/settings/components/settings-section"

function FormerEmployeeSection({
  employee,
  open,
  pending,
  onOpenChange,
  onRehire,
}: {
  employee: CompanyEmployeeDetail
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onRehire: (locationIds: Array<string>) => Promise<void>
}) {
  const [locationIds, setLocationIds] = React.useState<Array<string>>([])

  React.useEffect(() => {
    if (open) setLocationIds([])
  }, [open])

  function toggleLocation(locationId: string, checked: boolean) {
    setLocationIds((current) =>
      checked
        ? [...current, locationId]
        : current.filter((id) => id !== locationId)
    )
  }

  return (
    <SettingsSection
      icon={UserRoundCheckIcon}
      title="Rehire employee"
      description="Restore access without losing pay, payroll details or history."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="max-w-lg text-xs leading-5 text-[#61709a]">
          Choose the locations where this employee should be active again.
        </p>
        <Button
          type="button"
          disabled={pending}
          onClick={() => onOpenChange(true)}
        >
          Rehire employee
        </Button>
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 sm:max-w-md">
          <DialogHeader className="p-5 pb-4">
            <DialogTitle>Rehire {employee.name}</DialogTitle>
            <DialogDescription>
              Choose at least one location. This restores employee-level access
              only; admin access and old future shifts are not restored.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 divide-y divide-[#edf0f6] overflow-y-auto px-5">
            {employee.locations.map((location) => (
              <label
                key={location.id}
                className="flex cursor-pointer items-center justify-between gap-3 py-3"
              >
                <span className="text-sm font-semibold">{location.name}</span>
                <Checkbox
                  checked={locationIds.includes(location.id)}
                  disabled={pending}
                  onCheckedChange={(checked) =>
                    toggleLocation(location.id, Boolean(checked))
                  }
                />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || locationIds.length === 0}
              onClick={() => {
                void onRehire(locationIds).then(() => onOpenChange(false))
              }}
            >
              {pending ? "Rehiring..." : "Rehire employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  )
}

function RemoveEmployeeDialog({
  employeeName,
  open,
  pending,
  onOpenChange,
  onRemove,
}: {
  employeeName: string
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onRemove: () => Promise<void>
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove {employeeName} from the organisation?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This revokes organisation and location access, and removes them from
            shifts that have not started. Their historical rota, time, payroll,
            and billing records will be kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => {
              void onRemove().then(() => onOpenChange(false))
            }}
          >
            {pending ? "Removing..." : "Remove employee"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { FormerEmployeeSection, RemoveEmployeeDialog }

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useShiftAssignment } from "@/features/rota/hooks/use-shift-assignment"
import { getStaffGroupColorAppearance } from "@/features/staff-groups/constants/staff-group-colors"
import { cn } from "@/lib/utils"

function AssignShiftDialog({
  shiftId,
  shiftLabel,
  returnFocusRef,
  onClose,
}: {
  shiftId: string
  shiftLabel: string
  returnFocusRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { options, isAssigning, canAssign, assignEmployee } =
    useShiftAssignment(shiftId)

  async function handleSelect(employeeId: string) {
    if (await assignEmployee(employeeId)) onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        initialFocus={inputRef}
        finalFocus={returnFocusRef}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Assign an employee</DialogTitle>
          <DialogDescription>{shiftLabel}</DialogDescription>
        </DialogHeader>
        <Command aria-busy={isAssigning} label="Search employees">
          <CommandInput
            ref={inputRef}
            aria-label="Search employees"
            placeholder="Search employees or groups…"
          />
          <CommandList label="Employees">
            <CommandEmpty>
              {options.length === 0
                ? "No employees available at this location."
                : "No employees match your search."}
            </CommandEmpty>
            {options.map(({ employee, groupName, disabledReason }) => {
              const appearance = getStaffGroupColorAppearance(
                employee.groupColor
              )
              return (
                <CommandItem
                  key={employee.id}
                  value={employee.id}
                  keywords={[employee.name, groupName]}
                  disabled={
                    Boolean(disabledReason) || isAssigning || !canAssign
                  }
                  onSelect={() => {
                    void handleSelect(employee.id)
                  }}
                  className="py-2.5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      appearance.dotClassName
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {employee.name}
                    </span>
                    <span className="block truncate text-muted-foreground">
                      {groupName}
                    </span>
                  </span>
                  {disabledReason ? (
                    <span className="text-[10px] text-muted-foreground">
                      {disabledReason}
                    </span>
                  ) : null}
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
        <p className="text-xs text-muted-foreground">
          Use the arrow keys to choose an employee and Enter to assign.
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default AssignShiftDialog

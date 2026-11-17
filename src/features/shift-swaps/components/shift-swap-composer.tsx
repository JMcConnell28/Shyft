import { useMemo, useState } from "react"
import { LoaderCircleIcon } from "lucide-react"
// eslint-disable-next-line no-duplicate-imports
import type { ReactNode } from "react"

import type {
  ShiftSwapPageData,
  ShiftSwapShift,
} from "@/features/shift-swaps/types"
import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { DashboardCard } from "@/features/dashboard/components/dashboard-card"

type ShiftSwapComposerProps = {
  data: ShiftSwapPageData
  isCreatingCover: boolean
  isCreatingSwap: boolean
  onCreateCover: (assignmentId: string) => void
  onCreateSwap: (sourceAssignmentId: string, targetAssignmentId: string) => void
}

const selectClassName =
  "w-full [&_select]:h-11 [&_select]:rounded-lg [&_select]:bg-card [&_select]:pr-8 [&_select]:pl-3 [&_select]:text-base [&_select]:font-medium [&_select]:text-ellipsis dark:[&_select]:bg-card md:[&_select]:h-8 md:[&_select]:text-sm [&_svg]:right-2.5 [&_svg]:size-4"

function ShiftSwapComposer({
  data,
  isCreatingCover,
  isCreatingSwap,
  onCreateCover,
  onCreateSwap,
}: ShiftSwapComposerProps) {
  const [rotaId, setRotaId] = useState("")
  const [ownShiftId, setOwnShiftId] = useState("")
  const [swapShiftId, setSwapShiftId] = useState("")
  const selectedRotaId = data.rotas.some((rota) => rota.id === rotaId)
    ? rotaId
    : (data.rotas[0]?.id ?? "")
  const ownRotaShifts = useMemo(
    () => data.ownShifts.filter((shift) => shift.rotaId === selectedRotaId),
    [data.ownShifts, selectedRotaId]
  )
  const selectedOwnShiftId = ownRotaShifts.some(
    (shift) => shift.assignmentId === ownShiftId
  )
    ? ownShiftId
    : (ownRotaShifts[0]?.assignmentId ?? "")
  const sourceShift = ownRotaShifts.find(
    (shift) => shift.assignmentId === selectedOwnShiftId
  )
  const targetShifts = useMemo(
    () =>
      sourceShift
        ? data.swapTargetShifts.filter(
            (shift) =>
              shift.rotaId === sourceShift.rotaId &&
              shift.locationId === sourceShift.locationId &&
              shift.staffGroupId === sourceShift.staffGroupId &&
              shift.employeeId !== sourceShift.employeeId
          )
        : [],
    [data.swapTargetShifts, sourceShift]
  )
  const selectedSwapShiftId = targetShifts.some(
    (shift) => shift.assignmentId === swapShiftId
  )
    ? swapShiftId
    : (targetShifts[0]?.assignmentId ?? "")
  const isCreating = isCreatingCover || isCreatingSwap

  return (
    <DashboardCard
      title="New request"
      headingId="shift-swap-new-request"
      description="Choose one of your published shifts to swap or offer for cover."
    >
      <div className="grid gap-3 p-4 @min-[42rem]/shift-swaps:grid-cols-3">
        <Field label="Rota">
          <NativeSelect
            className={selectClassName}
            value={selectedRotaId}
            onChange={(event) => setRotaId(event.target.value)}
          >
            {data.rotas.length === 0 ? (
              <NativeSelectOption value="">
                No published rotas
              </NativeSelectOption>
            ) : null}
            {data.rotas.map((rota) => (
              <NativeSelectOption key={rota.id} value={rota.id}>
                {rota.weekLabel} · {rota.locationName}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Your shift">
          <ShiftSelect
            emptyLabel="No eligible shifts"
            shifts={ownRotaShifts}
            value={selectedOwnShiftId}
            onChange={setOwnShiftId}
          />
        </Field>
        <Field label="Swap with">
          <ShiftSelect
            emptyLabel="No matching shifts"
            showEmployee
            shifts={targetShifts}
            value={selectedSwapShiftId}
            onChange={setSwapShiftId}
          />
        </Field>
        <div className="flex flex-wrap gap-2 @min-[42rem]/shift-swaps:col-span-full @min-[42rem]/shift-swaps:justify-end">
          <Button
            variant="primary"
            disabled={!selectedOwnShiftId || !selectedSwapShiftId || isCreating}
            onClick={() =>
              onCreateSwap(selectedOwnShiftId, selectedSwapShiftId)
            }
          >
            {isCreatingSwap ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
            ) : null}
            Request swap
          </Button>
          <Button
            variant="secondary"
            disabled={!selectedOwnShiftId || isCreating}
            onClick={() => onCreateCover(selectedOwnShiftId)}
          >
            {isCreatingCover ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
            ) : null}
            Put up for cover
          </Button>
        </div>
      </div>
    </DashboardCard>
  )
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  )
}

function ShiftSelect({
  emptyLabel,
  onChange,
  showEmployee = false,
  shifts,
  value,
}: {
  emptyLabel: string
  onChange: (value: string) => void
  showEmployee?: boolean
  shifts: Array<ShiftSwapShift>
  value: string
}) {
  return (
    <NativeSelect
      className={selectClassName}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {shifts.length === 0 ? (
        <NativeSelectOption value="">{emptyLabel}</NativeSelectOption>
      ) : null}
      {shifts.map((shift) => (
        <NativeSelectOption key={shift.assignmentId} value={shift.assignmentId}>
          {shift.dateLabel}, {shift.timeLabel} ·{" "}
          {showEmployee ? `${shift.employeeName} · ` : null}
          {shift.zoneName || "No zone"}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

export { ShiftSwapComposer }

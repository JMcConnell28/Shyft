import { useMemo, useState } from "react"
import { ArrowRightLeftIcon, LoaderCircleIcon } from "lucide-react"
// eslint-disable-next-line no-duplicate-imports
import type { ReactNode } from "react"

import type {
  ShiftSwapPageData,
  ShiftSwapShift,
} from "@/features/shift-swaps/types"
import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  ShiftSwapPanel,
  ShiftSwapPanelHeader,
} from "@/features/shift-swaps/components/shift-swap-panel"

type ShiftSwapComposerProps = {
  data: ShiftSwapPageData
  isCreating: boolean
  onCreateCover: (assignmentId: string) => void
  onCreateSwap: (sourceAssignmentId: string, targetAssignmentId: string) => void
}

const selectClassName =
  "w-full [&_select]:h-10 [&_select]:rounded-xl [&_select]:border-[#dfe5f0] [&_select]:bg-white [&_select]:px-3 [&_select]:pr-8 [&_select]:text-sm [&_select]:font-medium [&_select]:text-[#11245a]"

function ShiftSwapComposer({
  data,
  isCreating,
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

  return (
    <ShiftSwapPanel>
      <ShiftSwapPanelHeader
        icon={ArrowRightLeftIcon}
        subtitle="Choose one of your published shifts to swap or offer for cover."
        title="New request"
      />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
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
                {rota.weekLabel} - {rota.locationName}
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
            shifts={targetShifts}
            value={selectedSwapShiftId}
            onChange={setSwapShiftId}
          />
        </Field>
        <div className="grid gap-2 sm:flex lg:col-span-3 xl:col-span-1 xl:justify-end">
          <Button
            className="h-10 rounded-xl font-semibold"
            disabled={!selectedOwnShiftId || !selectedSwapShiftId || isCreating}
            onClick={() =>
              onCreateSwap(selectedOwnShiftId, selectedSwapShiftId)
            }
          >
            {isCreating ? <LoaderCircleIcon className="animate-spin" /> : null}
            Request swap
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-[#dfe5f0] bg-white font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
            disabled={!selectedOwnShiftId || isCreating}
            onClick={() => onCreateCover(selectedOwnShiftId)}
          >
            Put up for cover
          </Button>
        </div>
      </div>
    </ShiftSwapPanel>
  )
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#68769a] uppercase">
      {label}
      {children}
    </label>
  )
}

function ShiftSelect({
  emptyLabel,
  onChange,
  shifts,
  value,
}: {
  emptyLabel: string
  onChange: (value: string) => void
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
          {shift.employeeName} - {shift.dateLabel}, {shift.timeLabel} -{" "}
          {shift.zoneName || "No zone"}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

export { ShiftSwapComposer }

const staffGroupColorOptions = [
  "slate",
  "sky",
  "emerald",
  "amber",
  "rose",
  "violet",
  "cyan",
  "orange",
] as const

type StaffGroupColor = (typeof staffGroupColorOptions)[number]

type StaffGroupColorAppearance = {
  badgeClassName: string
  buttonClassName: string
  cardClassName: string
  dotClassName: string
  label: string
  pdfHexColor: string
  swatchClassName: string
}

const staffGroupColorAppearance: Record<
  StaffGroupColor,
  StaffGroupColorAppearance
> = {
  slate: {
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
    buttonClassName:
      "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
    cardClassName: "border-l-slate-400",
    dotClassName: "bg-slate-500",
    label: "Slate",
    pdfHexColor: "#64748B",
    swatchClassName: "bg-slate-500",
  },
  sky: {
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
    buttonClassName: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
    cardClassName: "border-l-sky-400",
    dotClassName: "bg-sky-500",
    label: "Sky",
    pdfHexColor: "#0EA5E9",
    swatchClassName: "bg-sky-500",
  },
  emerald: {
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    buttonClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    cardClassName: "border-l-emerald-400",
    dotClassName: "bg-emerald-500",
    label: "Emerald",
    pdfHexColor: "#10B981",
    swatchClassName: "bg-emerald-500",
  },
  amber: {
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    buttonClassName:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    cardClassName: "border-l-amber-400",
    dotClassName: "bg-amber-500",
    label: "Amber",
    pdfHexColor: "#F59E0B",
    swatchClassName: "bg-amber-500",
  },
  rose: {
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    buttonClassName:
      "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    cardClassName: "border-l-rose-400",
    dotClassName: "bg-rose-500",
    label: "Rose",
    pdfHexColor: "#F43F5E",
    swatchClassName: "bg-rose-500",
  },
  violet: {
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
    buttonClassName:
      "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
    cardClassName: "border-l-violet-400",
    dotClassName: "bg-violet-500",
    label: "Violet",
    pdfHexColor: "#8B5CF6",
    swatchClassName: "bg-violet-500",
  },
  cyan: {
    badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-700",
    buttonClassName:
      "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    cardClassName: "border-l-cyan-400",
    dotClassName: "bg-cyan-500",
    label: "Cyan",
    pdfHexColor: "#06B6D4",
    swatchClassName: "bg-cyan-500",
  },
  orange: {
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
    buttonClassName:
      "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
    cardClassName: "border-l-orange-400",
    dotClassName: "bg-orange-500",
    label: "Orange",
    pdfHexColor: "#F97316",
    swatchClassName: "bg-orange-500",
  },
}

function isStaffGroupColor(value: string): value is StaffGroupColor {
  return staffGroupColorOptions.includes(value as StaffGroupColor)
}

function normalizeStaffGroupColor(value: string | null | undefined): StaffGroupColor {
  return value && isStaffGroupColor(value) ? value : "slate"
}

function getStaffGroupColorAppearance(color: string): StaffGroupColorAppearance {
  return staffGroupColorAppearance[normalizeStaffGroupColor(color)]
}

export {
  getStaffGroupColorAppearance,
  isStaffGroupColor,
  normalizeStaffGroupColor,
  staffGroupColorOptions,
}

export type { StaffGroupColor, StaffGroupColorAppearance }

function FlagSelect<T extends string>({
  label,
  value,
  options,
  labels,
  disabled,
  onChange,
}: {
  label: string
  value: T
  options: ReadonlyArray<T>
  labels: Record<T, string>
  disabled?: boolean
  onChange: (value: T) => void
}) {
  return (
    <select
      aria-label={label}
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm disabled:opacity-50"
      value={value}
      disabled={disabled}
      onChange={(event) => {
        const selected = options.find((option) => option === event.target.value)
        if (selected) onChange(selected)
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  )
}
export { FlagSelect }

import { Checkbox } from "@/components/ui/checkbox"
import { FieldError } from "@/components/ui/field"

type TermsAcceptanceFieldProps = {
  checked: boolean
  error?: string
  onChange: (checked: boolean) => void
}

function TermsAcceptanceField({
  checked,
  error,
  onChange,
}: TermsAcceptanceFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3 rounded-xl border border-[#cbd9f1] bg-[#f8fbff] p-3">
        <Checkbox
          id="accepts-terms"
          checked={checked}
          onCheckedChange={(value) => onChange(value === true)}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "accepts-terms-error" : undefined}
        />
        <span className="text-xs leading-5 text-[#52698f]">
          <label htmlFor="accepts-terms" className="cursor-pointer">
            I have read and agree to the{" "}
          </label>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#075fe6] underline underline-offset-4"
          >
            Terms and Conditions
          </a>
          .
        </span>
      </div>
      <FieldError id="accepts-terms-error">{error}</FieldError>
    </div>
  )
}

export { TermsAcceptanceField }

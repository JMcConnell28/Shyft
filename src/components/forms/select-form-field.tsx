import type { AnyFieldApi } from "@tanstack/react-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { getFieldError } from "@/lib/forms"

type SelectOption = {
  label: string
  value: string
}

type SelectFormFieldProps = {
  field: AnyFieldApi
  label: string
  options: SelectOption[]
  placeholder?: string
  description?: string
}

function SelectFormField({
  field,
  label,
  options,
  placeholder,
  description,
}: SelectFormFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <FieldContent>
        <NativeSelect
          id={field.name}
          name={field.name}
          className="w-full"
          value={(field.state.value ?? "") as string}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
        >
          <NativeSelectOption value="">
            {placeholder ?? "Choose an option"}
          </NativeSelectOption>
          {options.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { SelectFormField }

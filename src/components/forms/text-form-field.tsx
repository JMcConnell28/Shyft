import type { AnyFieldApi } from "@tanstack/react-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getFieldError } from "@/lib/forms"

type TextFormFieldProps = {
  field: AnyFieldApi
  label: string
  type?: React.ComponentProps<typeof Input>["type"]
  placeholder?: string
  autoComplete?: string
  description?: string
  required?: boolean
}

function TextFormField({
  field,
  label,
  type = "text",
  placeholder,
  autoComplete,
  description,
  required = false,
}: TextFormFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={field.name}
          name={field.name}
          type={type}
          placeholder={placeholder}
          value={(field.state.value ?? "") as string}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          autoComplete={autoComplete}
          required={required}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { TextFormField }

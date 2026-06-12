import { Button } from "@/components/ui/button"

type FormSubmitButtonProps = React.ComponentProps<typeof Button> & {
  children: React.ReactNode
  isSubmitting?: boolean
  submittingText?: string
}

function FormSubmitButton({
  children,
  isSubmitting = false,
  submittingText,
  disabled,
  type = "submit",
  ...props
}: FormSubmitButtonProps) {
  return (
    <Button
      {...props}
      type={type}
      disabled={disabled || isSubmitting}
      size={props.size ?? "lg"}
    >
      {isSubmitting ? submittingText ?? children : children}
    </Button>
  )
}

export { FormSubmitButton }

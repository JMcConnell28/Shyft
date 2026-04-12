import { Button } from "@/components/ui/button"

type FormSubmitButtonProps = {
  children: React.ReactNode
  isSubmitting?: boolean
  submittingText?: string
  className?: string
}

function FormSubmitButton({
  children,
  isSubmitting = false,
  submittingText,
  className,
}: FormSubmitButtonProps) {
  return (
    <Button className={className} type="submit" disabled={isSubmitting} size="lg">
      {isSubmitting ? submittingText ?? children : children}
    </Button>
  )
}

export { FormSubmitButton }

import { cn } from "@/lib/utils"

type FormErrorMessageProps = {
  message?: string | null
  className?: string
}

function FormErrorMessage({ message, className }: FormErrorMessageProps) {
  if (!message) {
    return null
  }

  return <p className={cn("text-sm text-destructive", className)}>{message}</p>
}

export { FormErrorMessage }

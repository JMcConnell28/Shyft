import { toast } from "sonner"

import { getErrorMessage } from "@/lib/errors"

type ToastOptions = NonNullable<Parameters<typeof toast.error>[1]>

function showSuccessToast(message: string, options?: ToastOptions) {
  return toast.success(message, {
    duration: 3200,
    ...options,
  })
}

function showErrorToast(
  error: unknown,
  options?: ToastOptions & {
    fallbackMessage?: string
  }
) {
  const { fallbackMessage = "Something went wrong.", ...toastOptions } =
    options ?? {}
  return toast.error(getErrorMessage(error, fallbackMessage), {
    duration: 6500,
    ...toastOptions,
  })
}

export { showErrorToast, showSuccessToast }

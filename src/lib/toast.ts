import { toast, type ToastOptions } from "react-hot-toast"

import { getErrorMessage } from "@/lib/errors"

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
  },
) {
  return toast.error(
    getErrorMessage(error, options?.fallbackMessage ?? "Something went wrong."),
    {
      duration: 4200,
      ...options,
    },
  )
}

export { showErrorToast, showSuccessToast }

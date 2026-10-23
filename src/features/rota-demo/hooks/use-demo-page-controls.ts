import { useEffect, useMemo, useState } from "react"

import { createDemoEmployees } from "@/features/rota-demo/data/create-demo-employees"
import { DEMO_DEFAULT_EMPLOYEE_COUNT } from "@/features/rota-demo/constants/demo-settings"
import { demoEmployeeCountSchema } from "@/features/rota-demo/schemas/demo-settings-schema"

export function useDemoPageControls() {
  const [employeeCount, setEmployeeCount] = useState(
    DEMO_DEFAULT_EMPLOYEE_COUNT
  )
  const [countInput, setCountInput] = useState(
    String(DEMO_DEFAULT_EMPLOYEE_COUNT)
  )
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [screenshotView, setScreenshotView] = useState(false)
  const employees = useMemo(
    () => createDemoEmployees(employeeCount),
    [employeeCount]
  )

  useEffect(() => {
    if (!screenshotView) return
    function restoreControls(event: KeyboardEvent) {
      if (event.key === "Escape") setScreenshotView(false)
    }
    window.addEventListener("keydown", restoreControls)
    return () => window.removeEventListener("keydown", restoreControls)
  }, [screenshotView])

  function applyCount(value = countInput) {
    const result = demoEmployeeCountSchema.safeParse(value)
    if (!result.success) {
      setError(
        result.error.issues[0]?.message ?? "Enter a valid employee count."
      )
      return
    }
    setEmployeeCount(result.data)
    setCountInput(String(result.data))
    setError(null)
  }

  function resetDemo() {
    setRevision((current) => current + 1)
    setCountInput(String(DEMO_DEFAULT_EMPLOYEE_COUNT))
    setEmployeeCount(DEMO_DEFAULT_EMPLOYEE_COUNT)
    setError(null)
  }

  return {
    employees,
    employeeCount,
    countInput,
    setCountInput,
    error,
    applyCount,
    resetDemo,
    revision,
    screenshotView,
    setScreenshotView,
  }
}

"use client"

import { useEffect, useRef, useState } from "react"
import { useServerFn } from "@tanstack/react-start"

import { startBillingPortal } from "@/features/billing/server-fns"
import { showErrorToast } from "@/lib/toast"

function useBillingPortal(input: {
  organizationId?: string | null
  locationId?: string | null
}) {
  const [isOpening, setIsOpening] = useState(false)
  const opening = useRef(false)
  const startPortal = useServerFn(startBillingPortal)

  useEffect(() => {
    function resetOpening() {
      opening.current = false
      setIsOpening(false)
    }
    window.addEventListener("pageshow", resetOpening)
    return () => window.removeEventListener("pageshow", resetOpening)
  }, [])

  async function openPortal(): Promise<void> {
    if (opening.current) return
    opening.current = true
    setIsOpening(true)
    try {
      const result = await startPortal({
        data: {
          organizationId: input.organizationId ?? undefined,
          locationId: input.locationId ?? undefined,
          returnPath: window.location.pathname,
        },
      })
      window.location.assign(result.portalUrl)
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not open billing management.",
      })
    } finally {
      opening.current = false
      setIsOpening(false)
    }
  }

  return { isOpening, openPortal }
}

export { useBillingPortal }

"use client"

import { useEffect } from "react"

function AdminPwaController() {
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return

    void navigator.serviceWorker.register("/sw.js")
  }, [])

  return null
}

export { AdminPwaController }

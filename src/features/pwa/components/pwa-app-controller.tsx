"use client"

import * as React from "react"

import {
  setInstallPrompt,
  type InstallPromptEvent,
} from "@/features/pwa/install-prompt"

const APP_ROUTE_PREFIXES = [
  "/accept-invitation/",
  "/billing/",
  "/clock/",
  "/dashboard",
  "/forgot-password",
  "/join/",
  "/login",
  "/onboarding/",
  "/reset-password",
  "/sign-up",
  "/verify-email",
  "/w/",
]

function isInstalledApp() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  )
}

function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function PwaAppController() {
  React.useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const clearInstallPrompt = () => setInstallPrompt(null)

    window.addEventListener("beforeinstallprompt", handleInstallPrompt)
    window.addEventListener("appinstalled", clearInstallPrompt)

    if (isInstalledApp() && !isAppRoute(window.location.pathname)) {
      window.location.replace("/dashboard")
    }

    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js")
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt)
      window.removeEventListener("appinstalled", clearInstallPrompt)
    }
  }, [])

  return null
}

export { PwaAppController }

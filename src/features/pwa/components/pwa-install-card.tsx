"use client"

import * as React from "react"
import { DownloadIcon, SmartphoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SettingsSection } from "@/features/settings/components/settings-section"
import {
  getInstallPrompt,
  setInstallPrompt,
  subscribe,
} from "@/features/pwa/install-prompt"

function PwaInstallCard() {
  const installPrompt = React.useSyncExternalStore(
    subscribe,
    getInstallPrompt,
    () => null
  )
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return

    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <SettingsSection
      title="RocketRota app"
      icon={SmartphoneIcon}
      description="Keep your rota a tap away on your home screen."
    >
      <div className="space-y-4 py-3">
        <p className="text-sm leading-6 text-muted-foreground">
          Install RocketRota for an app-like experience with quick access to
          your dashboard and rotas.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={!installPrompt || isInstalled}
          onClick={() => void handleInstall()}
        >
          <DownloadIcon />
          {isInstalled
            ? "App installed"
            : installPrompt
              ? "Install RocketRota"
              : "Use your browser install menu"}
        </Button>
      </div>
    </SettingsSection>
  )
}

export { PwaInstallCard }

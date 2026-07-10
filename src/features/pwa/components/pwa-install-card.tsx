"use client"

import * as React from "react"
import { DownloadIcon, SmartphoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <SmartphoneIcon className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm">RocketRota app</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  )
}

export { PwaInstallCard }

"use client"

import * as React from "react"
import { CopyIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  NTAG_CMAC_OFFSET_PLACEHOLDER,
  NTAG_PICC_OFFSET_PLACEHOLDER,
} from "@/features/time-clock/constants/ntag-clock"
import { useAdminClockTagMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useAdminClockTagsQuery } from "@/features/time-clock/hooks/use-time-clock-query"
import type { AdminClockTagsPageData } from "@/features/time-clock/types"

function AdminClockTagsPage({
  initialData,
  userId,
}: {
  initialData: AdminClockTagsPageData
  userId: string
}) {
  const query = useAdminClockTagsQuery({ userId })
  const data = query.data ?? initialData
  const { generateMutation } = useAdminClockTagMutations({ userId })
  const [selectedLocationId, setSelectedLocationId] = React.useState(
    data.locations[0]?.id ?? ""
  )
  const [origin, setOrigin] = React.useState("")

  React.useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const tagsByLocation = new Map<string, typeof data.tags>()

  for (const tag of data.tags) {
    const tags = tagsByLocation.get(tag.locationId) ?? []
    tags.push(tag)
    tagsByLocation.set(tag.locationId, tags)
  }

  return (
    <div className="min-h-dvh bg-muted/20 px-4 py-5 text-foreground">
      <main className="mx-auto max-w-5xl space-y-5">
        <header className="space-y-1">
          <p className="text-sm font-semibold text-primary">RocketRota admin</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Clock tag setup
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Generate fixed-width NTAG 424 setup values for a location.
          </p>
        </header>

        <Card className="border-border/70 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Generate setup data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 space-y-1 text-xs font-medium">
              <span>Location</span>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={selectedLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
              >
                {data.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                    {location.organizationName
                      ? ` - ${location.organizationName}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            <Button
              disabled={!selectedLocationId || generateMutation.isPending}
              onClick={() =>
                generateMutation.mutate({ locationId: selectedLocationId })
              }
            >
              {generateMutation.isPending ? <Spinner /> : <PlusIcon />}
              Generate tag data
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {data.locations.map((location) => {
            const tags = tagsByLocation.get(location.id) ?? []

            return (
              <Card
                key={location.id}
                className="border-border/70 bg-background shadow-sm"
              >
                <CardHeader>
                  <CardTitle className="text-sm">{location.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No NTAG setup data has been generated yet.
                    </p>
                  ) : (
                    tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="space-y-3 rounded-lg border border-border/70 p-3"
                      >
                        <p className="text-sm font-medium">{tag.label}</p>
                        <CopyableValue label="tag" value={tag.publicId} />
                        <CopyableValue label="AES key" value={tag.aesKeyHex} />
                        <CopyableValue
                          label="URL"
                          value={`${origin}/clock?tag=${tag.publicId}&picc=${NTAG_PICC_OFFSET_PLACEHOLDER}&cmac=${NTAG_CMAC_OFFSET_PLACEHOLDER}`}
                        />
                        <p className="text-xs text-muted-foreground">
                          Last seen counter: {tag.lastSeenCounter}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function CopyableValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs">
          {value}
        </code>
        <Button
          aria-label={`Copy ${label}`}
          size="icon"
          variant="outline"
          onClick={() => navigator.clipboard.writeText(value)}
        >
          <CopyIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export { AdminClockTagsPage }

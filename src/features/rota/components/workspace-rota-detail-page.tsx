"use client"

import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { WorkspaceSummary } from "@/features/onboarding/types"
import RotaViewWorkspace from "@/features/rota/components/rota-view-workspace"
import RotaWorkspace from "@/features/rota/components/rota-workspace"
import { useRotaWorkspaceQuery } from "@/features/rota/hooks/use-rota-workspace-query"

type WorkspaceRotaDetailPageProps = {
  locationSlug?: string
  publishedOnly: boolean
  rotaId: string
  userId: string
  workspace: WorkspaceSummary
}

function WorkspaceRotaDetailPage({
  locationSlug,
  publishedOnly,
  rotaId,
  userId,
  workspace,
}: WorkspaceRotaDetailPageProps) {
  const queryLocationSlug =
    workspace.type === "location" ? workspace.slug : locationSlug

  if (!queryLocationSlug) {
    throw new Error("A location slug is required for organization rota routes.")
  }

  const workspaceQuery = useRotaWorkspaceQuery({
    organizationId: workspace.type === "organization" ? workspace.id : undefined,
    orgSlug: workspace.type === "organization" ? workspace.slug : undefined,
    locationId: workspace.type === "location" ? workspace.id : undefined,
    locationSlug: queryLocationSlug,
    rotaId,
    userId,
    publishedOnly,
  })

  if (workspaceQuery.isPending) {
    return (
      <RotaWorkspaceLoadingState
        label={publishedOnly ? "Loading published rota..." : "Loading rota board..."}
      />
    )
  }

  if (workspaceQuery.isError) {
    return (
      <RotaWorkspaceErrorState
        title={publishedOnly ? "Published rota unavailable" : "We could not load this rota"}
        message={
          workspaceQuery.error instanceof Error
            ? workspaceQuery.error.message
            : publishedOnly
              ? "We could not load the published rota."
              : "We could not load that rota board."
        }
        onRetry={() => {
          void workspaceQuery.refetch()
        }}
      />
    )
  }

  if (publishedOnly) {
    return <RotaViewWorkspace boardData={workspaceQuery.data} />
  }

  return <RotaWorkspace boardData={workspaceQuery.data} />
}

function RotaWorkspaceLoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <Card className="border-border/70 bg-background/95 shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            {label}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RotaWorkspaceErrorState({
  message,
  onRetry,
  title,
}: {
  message: string
  onRetry: () => void
  title: string
}) {
  return (
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <Card className="border-border/70 bg-background/95 shadow-sm">
        <CardContent className="p-6">
          <Empty className="border border-dashed border-border/70 bg-muted/10 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlertIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>{title}</EmptyTitle>
              <EmptyDescription>{message}</EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </Empty>
        </CardContent>
      </Card>
    </div>
  )
}

export { WorkspaceRotaDetailPage }

import { createFileRoute } from "@tanstack/react-router"
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
import { RotaListPage } from "@/features/rota/components/rota-list-page"
import { useRotaListPageQuery } from "@/features/rota/hooks/use-rota-list-page-query"
import {
  parseRotaListSearch,
  type RotaListSearch,
  type RotaPageSize,
  type RotaRangeFilter,
} from "@/features/rota/schemas/rota-schemas"

export const Route = createFileRoute("/_authed/_verified/w/$workspaceSlug/rota/")({
  validateSearch: parseRotaListSearch,
  component: RotaWorkspaceRoute,
})

function RotaWorkspaceRoute() {
  const { viewer } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for rota routes.")
  }

  const rotaListQuery = useRotaListPageQuery({
    organizationId:
      activeWorkspace.type === "organization" ? activeWorkspace.id : undefined,
    orgSlug:
      activeWorkspace.type === "organization" ? activeWorkspace.slug : undefined,
    locationId:
      activeWorkspace.type === "location" ? activeWorkspace.id : undefined,
    locationSlug:
      activeWorkspace.type === "location" ? activeWorkspace.slug : undefined,
    userId: viewer.user.id,
    search,
  })

  function updateSearch(
    nextValue: Partial<RotaListSearch>,
    options?: {
      resetPage?: boolean
    },
  ) {
    void navigate({
      search: (previous: RotaListSearch) => ({
        ...previous,
        ...nextValue,
        page: options?.resetPage ? 1 : (nextValue.page ?? previous.page),
      }),
    })
  }

  return (
    <>
      {rotaListQuery.isPending ? (
        <RotaListLoadingState />
      ) : rotaListQuery.isError ? (
        <RotaListErrorState
          message={
            rotaListQuery.error instanceof Error
              ? rotaListQuery.error.message
              : "We could not load your rota list."
          }
          onRetry={() => {
            void rotaListQuery.refetch()
          }}
        />
      ) : (
        <RotaListPage
          data={rotaListQuery.data}
          onLocationChange={(locationSlug) =>
            updateSearch({ location: locationSlug }, { resetPage: true })
          }
          onStatusChange={(status) =>
            updateSearch({ status }, { resetPage: true })
          }
          onRangeChange={(range) =>
            updateSearch(
              {
                range,
                from: undefined,
                to: undefined,
              },
              { resetPage: true },
            )
          }
          onCustomRangeChange={({ from, to }) =>
            updateSearch(
              {
                range: "custom" as RotaRangeFilter,
                from,
                to,
              },
              { resetPage: true },
            )
          }
          onPageSizeChange={(pageSize) =>
            updateSearch(
              { pageSize: pageSize as RotaPageSize },
              { resetPage: true },
            )
          }
          onPageChange={(page) => updateSearch({ page })}
        />
      )}
    </>
  )
}

function RotaListLoadingState() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
      <div className="space-y-2 rounded-xl border border-border/70 bg-background/95 p-4 shadow-sm">
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full max-w-md animate-pulse rounded bg-muted" />
      </div>
      <Card className="border-border/70 bg-background/95 shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            Loading rota list...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RotaListErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
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
              <EmptyTitle>We could not load the rota list</EmptyTitle>
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

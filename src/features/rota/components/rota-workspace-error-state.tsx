import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

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

export { RotaWorkspaceErrorState }

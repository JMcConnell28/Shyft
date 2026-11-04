import type { ReactNode } from "react"
import type { DashboardView } from "@/features/dashboard/schemas/dashboard-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const dashboardTabClassName =
  "h-11 rounded-none px-3 text-sm font-medium text-muted-foreground after:bottom-0 after:bg-primary data-active:text-foreground md:h-10"

function DashboardViewTabs({
  canManage,
  view,
  onViewChange,
  children,
}: {
  canManage: boolean
  view: DashboardView
  onViewChange: (view: DashboardView) => void
  children: ReactNode
}) {
  if (!canManage) return children

  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        if (value === "personal" || value === "manager") onViewChange(value)
      }}
      className="min-w-0 flex-1 gap-0"
    >
      <div className="border-b border-border px-4 sm:px-6">
        <TabsList
          aria-label="Dashboard view"
          variant="line"
          className="max-w-full justify-start gap-2 p-0 group-data-horizontal/tabs:h-11 md:group-data-horizontal/tabs:h-10"
        >
          <TabsTrigger value="personal" className={dashboardTabClassName}>
            My dashboard
          </TabsTrigger>
          <TabsTrigger value="manager" className={dashboardTabClassName}>
            Manager dashboard
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="personal" className="flex flex-col">
        {view === "personal" ? children : null}
      </TabsContent>
      <TabsContent value="manager" className="flex flex-col">
        {view === "manager" ? children : null}
      </TabsContent>
    </Tabs>
  )
}

export { DashboardViewTabs }

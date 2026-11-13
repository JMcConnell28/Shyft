import type { ReactNode } from "react"
import type { DashboardView } from "@/features/dashboard/schemas/dashboard-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const dashboardTabClassName =
  "h-auto min-h-11 min-w-0 flex-auto rounded-lg px-2.5 text-sm whitespace-normal text-muted-foreground data-active:bg-card data-active:shadow-xs sm:px-3 md:min-h-8 dark:data-active:border-border dark:data-active:bg-card"

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
      <div className="px-4 pt-3 sm:px-6">
        <TabsList
          aria-label="Dashboard view"
          className="max-w-full rounded-xl p-1 group-data-horizontal/tabs:h-auto"
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

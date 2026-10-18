import type { ReactNode } from "react"
import type { DashboardView } from "@/features/dashboard/schemas/dashboard-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      className="flex-1 gap-0"
    >
      <div className="border-b px-4 py-3 sm:px-6 lg:px-7">
        <TabsList aria-label="Dashboard view" className="w-full sm:w-fit">
          <TabsTrigger value="personal" className="px-3">
            My dashboard
          </TabsTrigger>
          <TabsTrigger value="manager" className="px-3">
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

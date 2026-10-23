import { createFileRoute } from "@tanstack/react-router"
import { roleHasAdminPermission } from "@rocketrota/shared/admin"
import { CustomerPage } from "@/features/customers/components/customer-page"
import { customerIdSchema } from "@/features/customers/schemas"

export const Route = createFileRoute("/_admin/customers/$customerId")({
  params: {
    parse: (params) => ({
      customerId: customerIdSchema.parse(params.customerId),
    }),
  },
  component: CustomerRoute,
})
function CustomerRoute() {
  const { customerId } = Route.useParams()
  const { membership } = Route.useRouteContext()
  return (
    <CustomerPage
      id={customerId}
      canManage={roleHasAdminPermission(
        membership.role,
        "clock_stations.manage"
      )}
    />
  )
}

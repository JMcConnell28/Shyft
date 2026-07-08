import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authed/_verified/o/$orgSlug/rota/$locationSlug/$rotaId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_authed/_verified/o/$orgSlug/rota/$locationSlug/$rotaId"!</div>
  )
}

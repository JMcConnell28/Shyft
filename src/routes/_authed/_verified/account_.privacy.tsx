import { Link, createFileRoute } from "@tanstack/react-router"
import { PersonalDataPage } from "@/features/personal-data/components/personal-data-page"

export const Route = createFileRoute("/_authed/_verified/account_/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & data | RocketRota" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PersonalPrivacyRoute,
})
function PersonalPrivacyRoute() {
  const { navigationSession } = Route.useRouteContext()
  return (
    <main className="min-h-dvh bg-background px-4 py-6">
      <div className="mx-auto mb-5 max-w-3xl">
        <Link to="/dashboard" className="text-sm underline">
          Back to RocketRota
        </Link>
      </div>
      <PersonalDataPage userId={navigationSession.user.id} />
    </main>
  )
}

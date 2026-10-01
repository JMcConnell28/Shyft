import { Link, Outlet } from "@tanstack/react-router"

function AccountLayout({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#f6f8fc] px-4 py-5 text-[#10204b] sm:px-5 sm:py-6 lg:px-7">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-[-0.035em]">Account</h1>
        <p className="mt-1 text-xs font-medium text-[#657398]">
          Your personal details, sign-in options and preferences.
        </p>
        <nav
          aria-label="Account settings"
          className="mt-4 flex gap-2 border-b border-[#dfe4ef] pb-3 text-xs font-semibold"
        >
          <Link
            to="/app/$workspaceSlug/account"
            params={{ workspaceSlug }}
            activeOptions={{ exact: true }}
            className="rounded-lg px-3 py-2"
            activeProps={{ className: "bg-blue-50 text-blue-600" }}
          >
            Account details
          </Link>
          <Link
            to="/app/$workspaceSlug/account/preferences"
            params={{ workspaceSlug }}
            className="rounded-lg px-3 py-2"
            activeProps={{ className: "bg-blue-50 text-blue-600" }}
          >
            Preferences
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}

export { AccountLayout }

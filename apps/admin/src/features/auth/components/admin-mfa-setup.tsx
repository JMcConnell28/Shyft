import { AdminAuthShell, adminAuthInputClass } from "./admin-auth-shell"
import { Button } from "@/components/ui/button"
import { useAdminMfaSetup } from "@/features/auth/hooks/use-admin-mfa-setup"

function AdminMfaSetup() {
  const { setup, error, pending, submit } = useAdminMfaSetup()
  const secret = setup
    ? new URL(setup.totpURI).searchParams.get("secret")
    : null
  return (
    <AdminAuthShell
      title="Protect your admin account"
      description="Set up an authenticator before accessing the admin console."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void submit(new FormData(event.currentTarget))
        }}
      >
        {!setup ? (
          <label className="block space-y-1 text-sm font-medium">
            Confirm your password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={adminAuthInputClass}
            />
          </label>
        ) : (
          <>
            <p className="text-sm">
              Add a time-based account named RocketRota Admin in your
              authenticator using this setup key:
            </p>
            <code className="block rounded bg-slate-100 p-3 text-sm break-all">
              {secret}
            </code>
            <p className="text-sm">
              Save these recovery codes somewhere private. Each code works once.
            </p>
            <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
              {setup.backupCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" required />I have saved my recovery codes.
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Authenticator code
              <input
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                required
                className={adminAuthInputClass}
              />
            </label>
          </>
        )}
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <Button className="w-full" disabled={pending} type="submit">
          {pending
            ? "Working..."
            : setup
              ? "Verify and continue"
              : "Set up authenticator"}
        </Button>
      </form>
    </AdminAuthShell>
  )
}

export { AdminMfaSetup }

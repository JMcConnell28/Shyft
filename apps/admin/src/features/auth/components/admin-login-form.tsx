import { AdminAuthShell, adminAuthInputClass } from "./admin-auth-shell"
import { Button } from "@/components/ui/button"
import { useAdminLogin } from "@/features/auth/hooks/use-admin-login"

function AdminLoginForm() {
  const login = useAdminLogin()
  return (
    <AdminAuthShell
      title="Admin"
      description={
        login.mode === "password"
          ? "Sign in with a provisioned admin account."
          : "Verify your admin sign-in."
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void login.submit(new FormData(event.currentTarget))
        }}
      >
        {login.mode === "password" ? (
          <>
            <label className="block space-y-1 text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className={adminAuthInputClass}
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={adminAuthInputClass}
              />
            </label>
          </>
        ) : (
          <label className="block space-y-1 text-sm font-medium">
            {login.mode === "totp" ? "Authenticator code" : "Recovery code"}
            <input
              key={login.mode}
              name="code"
              required
              autoComplete="one-time-code"
              inputMode={login.mode === "totp" ? "numeric" : "text"}
              pattern={login.mode === "totp" ? "[0-9]{6}" : undefined}
              className={adminAuthInputClass}
            />
          </label>
        )}
        {login.error ? (
          <p role="alert" className="text-sm text-red-600">
            {login.error}
          </p>
        ) : null}
        <Button className="w-full" disabled={login.pending} type="submit">
          {login.pending ? "Verifying..." : "Continue"}
        </Button>
        {login.mode !== "password" ? (
          <button
            type="button"
            className="text-sm underline"
            onClick={() =>
              login.setMode(login.mode === "totp" ? "backup" : "totp")
            }
          >
            {login.mode === "totp"
              ? "Use a recovery code"
              : "Use authenticator code"}
          </button>
        ) : null}
      </form>
    </AdminAuthShell>
  )
}

export { AdminLoginForm }

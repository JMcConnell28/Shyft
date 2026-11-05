import { Link } from "@tanstack/react-router"
import { ClockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

function TimeAttendanceSetupPrompt({
  workspaceSlug,
  canActivate,
}: {
  workspaceSlug: string
  canActivate: boolean
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-xl border bg-card p-6 sm:p-8">
      <ClockIcon className="mb-4 size-8 text-primary" aria-hidden="true" />
      <h1 className="text-xl font-semibold tracking-tight">
        Bring your rota and attendance together
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Time &amp; Attendance hasn’t been set up for your locations yet. Enable
        it to use the clocking tools.
      </p>
      <ul className="my-6 list-disc space-y-3 pl-5 text-sm leading-6">
        <li>Let your team clock in and out at an NFC station.</li>
        <li>Compare actual attendance with scheduled shifts.</li>
        <li>
          Review missed clock-outs and attendance exceptions before payroll.
        </li>
      </ul>
      {canActivate ? (
        <>
          <Button
            nativeButton={false}
            render={
              <Link
                to="/app/$workspaceSlug/settings/billing"
                params={{ workspaceSlug }}
              />
            }
          >
            Explore Time &amp; Attendance
          </Button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Review pricing and station setup in billing before choosing to
            activate.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Ask your organisation owner to set up Time &amp; Attendance.
        </p>
      )}
    </section>
  )
}

export { TimeAttendanceSetupPrompt }

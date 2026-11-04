import type { ReactNode } from "react"

const adminAuthInputClass =
  "h-10 w-full rounded-md border border-slate-200 px-3"

function AdminAuthShell({
  children,
  title,
  description,
}: {
  children: ReactNode
  title: string
  description: string
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <img src="/pwa/icon-192.png" alt="" className="size-12 rounded-xl" />
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
        {children}
      </section>
    </main>
  )
}

export { AdminAuthShell, adminAuthInputClass }

import * as React from "react"

const ShellBody = React.memo(function ShellBodyComponent({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-xl border border-dashed bg-muted/20 p-8">
        <p className="text-sm text-muted-foreground">
          Placeholder content for the {title.toLowerCase()} route.
        </p>
      </div>
    </div>
  )
})

export { ShellBody }

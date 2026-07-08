import { cn } from "@/lib/utils"

function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center overflow-hidden rounded-xl bg-white p-1",
        className
      )}
    >
      <img
        src="/brand/rocketrota-logo.png"
        alt=""
        className="h-full w-full object-contain"
      />
    </div>
  )
}

function BrandLockup({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 transition-[gap,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 motion-reduce:transition-none",
        className
      )}
    >
      <BrandMark className="shrink-0" />
      <div className="min-w-0 transition-[opacity,transform] duration-200 ease-out group-data-[collapsible=icon]:hidden motion-reduce:transition-none">
        <p className="font-heading text-sm font-bold tracking-tight">
          RocketRota
        </p>
        {!compact ? (
          <p className="text-xs text-muted-foreground">
            Rota management solutions
          </p>
        ) : null}
      </div>
    </div>
  )
}

export { BrandLockup, BrandMark }

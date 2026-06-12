import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

function MarketingFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="grid gap-10 border-t border-[#e2eaf9] px-2 py-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/brand/rocketrota-logo.png"
              alt="RocketRota"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-extrabold tracking-tight text-[#16346e]">
              RocketRota
            </span>
          </div>
          <p className="mt-5 max-w-[260px] text-sm leading-7 text-[#65799f]">
            Smart rota management for modern teams. Save time, stay organised,
            keep everyone happy.
          </p>
        </div>

        <FooterColumn
          title="Product"
          items={["Features", "Pricing", "Integrations", "Updates"]}
        />
        <FooterColumn
          title="Resources"
          items={[{ label: "Help Centre", href: "/help" }]}
        />
        <FooterColumn
          title="Company"
          items={["About us", "Careers", "Contact", "Privacy"]}
        />

        <div>
          <h3 className="text-base font-extrabold tracking-tight text-[#16346e]">
            Stay in the loop
          </h3>
          <p className="mt-4 text-sm leading-7 text-[#65799f]">
            Get tips, product updates and best practices straight to your inbox.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <div className="flex h-12 flex-1 items-center rounded-2xl border border-[#dbe5f7] bg-white px-4 text-sm text-[#94a3bf]">
              Enter your email
            </div>
            <Button className="size-12 rounded-2xl bg-[#2c69ff] hover:bg-[#2259e3]">
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#e2eaf9] px-2 pt-6 text-sm text-[#7a8dac] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2024 RocketRota. All rights reserved.</p>
        <div className="flex gap-6">
          <button type="button">Privacy Policy</button>
          <button type="button">Terms of Service</button>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  items,
}: {
  title: string
  items: Array<string | { label: string; href: string }>
}) {
  return (
    <div>
      <h3 className="text-base font-extrabold tracking-tight text-[#16346e]">
        {title}
      </h3>
      <div className="mt-5 space-y-3 text-sm text-[#65799f]">
        {items.map((item) => (
          <FooterItem key={typeof item === "string" ? item : item.label} item={item} />
        ))}
      </div>
    </div>
  )
}

function FooterItem({ item }: { item: string | { label: string; href: string } }) {
  if (typeof item === "string") {
    return (
      <button
        type="button"
        className="block text-left transition-opacity hover:opacity-70"
      >
        {item}
      </button>
    )
  }

  return (
    <a
      href={item.href}
      className="block text-left transition-opacity hover:opacity-70"
    >
      {item.label}
    </a>
  )
}

export { MarketingFooter }

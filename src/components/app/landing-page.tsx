import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  Layers3Icon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"

import { BrandLockup } from "@/components/app/brand"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Clean project foundation",
    description:
      "A confident starting point for internal tools, SaaS products, and client builds with typed routes and scalable structure.",
    icon: Layers3Icon,
  },
  {
    title: "UI system ready to ship",
    description:
      "A polished layer of shadcn and Base UI primitives that gives every new project consistency before feature work even begins.",
    icon: SparklesIcon,
  },
  {
    title: "Built for product teams",
    description:
      "Use the same boilerplate for marketing pages, onboarding, and app surfaces without redesigning your foundation every time.",
    icon: ShieldCheckIcon,
  },
]

const stats = [
  { label: "Routes to start from", value: "4" },
  { label: "Core UI primitives", value: "50+" },
  { label: "Time saved per kickoff", value: "Days" },
]

const checklist = [
  "Responsive landing page layout",
  "Reusable auth flows for sign in and onboarding",
  "Dashboard shell with navigation and reporting blocks",
]

function LandingPage() {
  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_45%,_rgba(241,245,249,0.7)_100%)] text-foreground">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_45%)]" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-6 lg:px-8">
          <BrandLockup />
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              search={{ redirect: "/dashboard" }}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Login
            </Link>
            <Link
              to="/sign-up"
              search={{ redirect: "/dashboard" }}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Create account
            </Link>
          </nav>
        </header>

        <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-24 px-6 pb-16 pt-8 lg:px-8 lg:pb-24 lg:pt-12">
          <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl space-y-8">
              <div className="space-y-4">
                <Badge variant="outline">Starter experience</Badge>
                <div className="space-y-4">
                  <h1 className="font-heading text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                    Launch products from a starter that already feels premium.
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Northstar is a product-ready TanStack Start boilerplate with
                    a strong first impression: marketing, auth, and dashboard
                    foundations all designed to be extended instead of replaced.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/sign-up"
                  search={{ redirect: "/dashboard" }}
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Start with this template
                  <ArrowRightIcon />
                </Link>
                <Link
                  to="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" })
                  )}
                >
                  Preview dashboard
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <Card
                    key={stat.label}
                    size="sm"
                    className="border border-border/60 bg-background/70 shadow-lg shadow-slate-950/5 backdrop-blur"
                  >
                    <CardContent className="space-y-1 pt-3">
                      <p className="text-2xl font-semibold tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border border-border/60 bg-background/80 shadow-2xl shadow-slate-950/10 backdrop-blur">
              <CardHeader className="border-b border-border/60">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="size-4 text-primary" />
                  Boilerplate snapshot
                </CardTitle>
                <CardDescription>
                  A first-run screen designed to make new projects feel finished
                  on day one.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-border/60 bg-muted/35 p-4"
                    >
                      <feature.icon className="mb-3 size-5 text-primary" />
                      <h3 className="mb-1 font-medium">{feature.title}</h3>
                      <p className="text-xs leading-6 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="grid gap-3">
                  {checklist.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2Icon className="size-4 text-primary" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border border-border/60 bg-background/75 shadow-lg shadow-slate-950/5 backdrop-blur"
              >
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>

          <section className="rounded-[2rem] border border-border/60 bg-slate-950 px-6 py-10 text-slate-50 shadow-2xl shadow-slate-950/20 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge className="bg-white/10 text-white hover:bg-white/10">
                  Ready for your next app
                </Badge>
                <h2 className="font-heading text-3xl font-semibold tracking-tight">
                  Reuse this foundation, then spend your energy on the product.
                </h2>
                <p className="text-sm leading-7 text-slate-300">
                  Keep the pages, replace the content, and start each new build
                  with a level of polish clients and teams can feel immediately.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/sign-up"
                  search={{ redirect: "/dashboard" }}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-white text-slate-950 hover:bg-white/90"
                  )}
                >
                  Create an account
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  Explore components
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export { LandingPage }

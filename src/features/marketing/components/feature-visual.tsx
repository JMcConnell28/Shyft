"use client"

import * as React from "react"

import { rotaPlanningScreenshotSrc } from "@/features/marketing/constants/feature-assets"
import {
  marketingFeaturePages,
  type MarketingFeatureSlug,
} from "@/features/marketing/content"
import { ProductScreenshotFrame } from "@/features/marketing/components/product-screenshot-frame"
import { cn } from "@/lib/utils"

const RotaPlanningFeaturePreview = React.lazy(
  () => import("@/features/rota-demo/components/rota-planning-feature-preview"),
)

type FeatureVisualProps = {
  feature: MarketingFeatureSlug
}

function FeatureVisual({ feature }: FeatureVisualProps) {
  if (feature === "rota-planning") {
    return <RotaPlanningScreenshotVisual />
  }

  const content = marketingFeaturePages[feature]

  return (
    <div className="overflow-hidden rounded-[30px] border border-[#dce7fb] bg-white shadow-[0_25px_70px_rgba(20,49,106,0.12)]">
      <div className="border-b border-[#edf2ff] bg-[#fbfdff] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#edf4ff] text-[#2c69ff]">
              <content.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#18316a]">
                {content.navTitle}
              </p>
              <p className="text-xs text-[#6d7fa3]">Live workspace preview</p>
            </div>
          </div>
          <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#2c69ff]">
            Today
          </span>
        </div>
      </div>

      <div className="grid min-h-[390px] gap-3 bg-[#f8fbff] p-4">
        {feature === "time-tracking" ? <TimeTrackingVisual /> : null}
        {feature === "timesheets" ? <TimesheetsVisual /> : null}
      </div>
    </div>
  )
}

function RotaPlanningScreenshotVisual() {
  return (
    <ProductScreenshotFrame
      src={rotaPlanningScreenshotSrc}
      alt="RocketRota rota planning workspace showing grouped team members and assigned shifts"
      fallback={
        <React.Suspense fallback={<div className="h-[540px] bg-[#f7faff]" />}>
          <RotaPlanningFeaturePreview />
        </React.Suspense>
      }
      className="lg:translate-y-3"
    />
  )
}

function TimeTrackingVisual() {
  return (
    <div className="grid h-full gap-3 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-[#e4ebf8] bg-white p-4 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8294b4]">
          Clock status
        </p>
        <div className="mt-5 space-y-3">
          {[
            ["Clocked in", "8 staff", "bg-emerald-50 text-emerald-700"],
            ["Starting soon", "3 staff", "bg-sky-50 text-sky-700"],
            ["Needs review", "1 entry", "bg-amber-50 text-amber-700"],
          ].map(([label, value, className]) => (
            <div key={label} className={cn("rounded-2xl px-4 py-3", className)}>
              <p className="text-sm font-extrabold">{value}</p>
              <p className="text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-[#e4ebf8] bg-white p-4 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8294b4]">
          Live activity
        </p>
        <div className="mt-4 space-y-3">
          {["Ava clocked in", "Noah started bar shift", "Ruby missed clock-out"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl bg-[#f6f9ff] px-3 py-3 text-sm">
              <span className="font-semibold text-[#18316a]">{item}</span>
              <span className="text-xs text-[#7385a7]">Now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimesheetsVisual() {
  return (
    <div className="rounded-2xl border border-[#e4ebf8] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.8fr] border-b border-[#edf2ff] pb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8294b4]">
        <span>Staff</span>
        <span>Scheduled</span>
        <span>Actual</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-[#edf2ff]">
        {[
          ["Ava Mitchell", "32h", "31h 45m", "Ready"],
          ["Noah Evans", "30h", "30h 20m", "Ready"],
          ["Ruby Patel", "20h", "18h 15m", "Review"],
          ["Oscar Hughes", "40h", "39h 30m", "Ready"],
          ["Grace Walker", "24h", "24h", "Ready"],
        ].map(([name, scheduled, actual, status]) => (
          <div key={name} className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.8fr] py-4 text-sm">
            <span className="font-semibold text-[#18316a]">{name}</span>
            <span className="text-[#65799f]">{scheduled}</span>
            <span className="text-[#65799f]">{actual}</span>
            <span
              className={cn(
                "w-fit rounded-full px-2.5 py-1 text-xs font-semibold",
                status === "Review"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700",
              )}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { FeatureVisual }

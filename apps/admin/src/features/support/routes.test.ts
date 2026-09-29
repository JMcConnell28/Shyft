import { Outlet } from "@tanstack/react-router"
import { describe, expect, it } from "vitest"

import { Route as SupportRoute } from "@/routes/_admin/support/route"

describe("admin support routes", () => {
  it("renders nested inbox and conversation routes through the outlet", () => {
    expect(SupportRoute.options.component).toBe(Outlet)
  })
})

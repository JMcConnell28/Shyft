// @vitest-environment node
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { builtinEnvironments } from "vitest/environments"
import { CustomerPage } from "./customer-page"
import type * as TestingLibrary from "@testing-library/react/pure"
import type { ReactNode } from "react"
import type { EnvironmentReturn } from "vitest/environments"
import type { CustomerDetail } from "../types"

let testing: typeof TestingLibrary
let environment: EnvironmentReturn | undefined
// Initialize DOM after the worker handshake: cold Windows imports can exceed
// Vitest's fixed startup deadline when jsdom is the worker environment.
beforeAll(async () => {
  environment = await builtinEnvironments.jsdom.setup(globalThis, {})
  testing = await import("@testing-library/react/pure")
}, 180000)
afterAll(async () => {
  await environment?.teardown(globalThis)
})

const { generate, update, customerQuery, tagsQuery } = vi.hoisted(() => ({
  generate: vi.fn(),
  update: vi.fn(),
  customerQuery: vi.fn(),
  tagsQuery: vi.fn(),
}))
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))
vi.mock("../hooks/use-customers", () => ({
  useSetupStationTag: () => ({
    mutate: generate,
    isPending: false,
    isError: false,
  }),
  useCustomer: customerQuery,
  useCustomerTags: tagsQuery,
  useUpdateFulfillment: () => ({
    mutate: update,
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}))
vi.mock("@/features/clock-stations/hooks/use-clock-station-mutations", () => ({
  useClockStationMutations: () => ({
    generateTagMutation: { mutate: generate, isPending: false, isError: false },
  }),
}))

const detail: CustomerDetail = {
  customer: {
    id: "org:demo",
    name: "Demo customer",
    email: "owner@example.test",
    stage: "active",
    createdAt: "2026-10-01T00:00:00Z",
    trialEndsAt: "2026-10-15T00:00:00Z",
    locationCount: 1,
    addonCount: 1,
    stationsNeeded: 1,
  },
  locations: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Harbour House",
      trialEndsAt: "2026-10-15T00:00:00Z",
      billingStatus: "active",
      addonStatus: "active",
      fulfillmentStatus: "pending",
      paymentConfirmedAt: "2026-10-15T00:00:00Z",
      invoiceId: "in_demo",
      needsStation: true,
      deliveryAddress: ["Test recipient", "Test address"],
      reference: null,
      notes: null,
      shippedAt: null,
      requests: [
        {
          id: "included:00000000-0000-4000-8000-000000000001",
          locationId: "00000000-0000-4000-8000-000000000001",
          source: "included",
          clockTagId: null,
          paymentStatus: "paid",
          isLive: true,
          fulfillmentStatus: "pending",
          paymentConfirmedAt: "2026-10-15T00:00:00Z",
          needsStation: true,
          deliveryAddress: ["Test recipient", "Test address"],
          reference: null,
          notes: null,
          shippedAt: null,
        },
      ],
    },
  ],
}
beforeEach(() => {
  vi.clearAllMocks()
  customerQuery.mockReturnValue({
    data: detail,
    isPending: false,
    isError: false,
  })
  tagsQuery.mockReturnValue({
    data: { appBaseUrl: "https://example.test", tags: [] },
    isPending: false,
    isError: false,
  })
})
afterEach(() => testing.cleanup())

describe("customer operations page", () => {
  it("tracks an extra station separately from the included station at the same location", () => {
    const { render, screen, fireEvent } = testing
    const extraId = "additional:00000000-0000-4000-8000-000000000003"
    customerQuery.mockReturnValue({
      data: {
        ...detail,
        locations: detail.locations.map((location) => ({
          ...location,
          requests: [
            ...location.requests,
            ...location.requests.map((request) => ({
              ...request,
              id: extraId,
              source: "additional" as const,
            })),
          ],
        })),
      },
      isPending: false,
      isError: false,
    })
    render(<CustomerPage id="org:demo" canManage />)
    expect(screen.getByText("Included station")).toBeTruthy()
    expect(screen.getByText(/Extra station ·/)).toBeTruthy()
    fireEvent.click(
      screen.getAllByRole("button", { name: "Create NFC tag" })[1]
    )
    expect(generate).toHaveBeenCalledWith({ requestId: extraId })
    fireEvent.click(
      screen.getAllByRole("button", { name: "Mark ready to send" })[1]
    )
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: extraId, status: "ready" })
    )
  })
  it("creates NFC setup for this customer's selected location", () => {
    const { render, screen, fireEvent } = testing
    render(<CustomerPage id="org:demo" canManage />)
    fireEvent.click(screen.getByRole("button", { name: "Create NFC tag" }))
    expect(generate).toHaveBeenCalledWith({
      requestId: detail.locations[0]?.requests[0]?.id,
    })
    fireEvent.click(screen.getByRole("button", { name: "Mark ready to send" }))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: detail.locations[0]?.requests[0]?.id,
        status: "ready",
      })
    )
    expect(screen.getByText(/No dispatch email is sent/)).toBeTruthy()
  })
  it("holds trial customers and unpaid requests without hiding them", () => {
    const { render, screen } = testing
    customerQuery.mockReturnValue({
      data: {
        ...detail,
        customer: { ...detail.customer, stage: "trial" },
        locations: detail.locations.map((location) => ({
          ...location,
          needsStation: false,
          paymentConfirmedAt: null,
          requests: location.requests.map((r) => ({
            ...r,
            needsStation: false,
            paymentConfirmedAt: null,
          })),
        })),
      },
      isPending: false,
      isError: false,
    })
    render(<CustomerPage id="org:demo" canManage />)
    expect(screen.getByText("Trial")).toBeTruthy()
    expect(
      screen
        .getByRole("button", { name: "Mark ready to send" })
        .hasAttribute("disabled")
    ).toBe(true)
  })
  it("does not expose NFC secrets or mutation controls to read-only staff", () => {
    const { render, screen } = testing
    render(<CustomerPage id="org:demo" canManage={false} />)
    expect(screen.queryByRole("button", { name: "Create NFC tag" })).toBeNull()
    expect(
      screen.queryByRole("button", { name: "Mark ready to send" })
    ).toBeNull()
    expect(tagsQuery).toHaveBeenCalledWith("org:demo", false)
  })
})

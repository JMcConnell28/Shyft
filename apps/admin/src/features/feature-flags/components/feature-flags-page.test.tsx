// @vitest-environment node
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from "vitest"
import { builtinEnvironments } from "vitest/environments"
import { FeatureFlagsPage } from "./feature-flags-page"
import { LocationFeatureFlags } from "./location-feature-flags"
import type * as TestingLibrary from "@testing-library/react/pure"
import type { EnvironmentReturn } from "vitest/environments"
import type { FeatureFlag } from "../types"

let testing: typeof TestingLibrary
let environment: EnvironmentReturn | undefined
beforeAll(async () => {
  environment = await builtinEnvironments.jsdom.setup(globalThis, {})
  testing = await import("@testing-library/react/pure")
}, 180000)
afterAll(async () => {
  await environment?.teardown(globalThis)
})
afterEach(() => testing.cleanup())
const { globalChange, locationChange, flagsQuery, locationQuery } = vi.hoisted(
  () => ({
    globalChange: vi.fn(),
    locationChange: vi.fn(),
    flagsQuery: vi.fn(),
    locationQuery: vi.fn(),
  })
)
vi.mock("../hooks/use-feature-flags-query", () => ({
  useFeatureFlagsQuery: flagsQuery,
}))
vi.mock("../hooks/use-feature-flag-mutations", () => ({
  useFeatureFlagMutations: () => ({
    updateMutation: { mutate: globalChange, isPending: false },
    locationMutation: { mutate: locationChange, isPending: false },
  }),
}))
vi.mock("../hooks/use-flag-details", () => ({
  useLocationFlags: locationQuery,
  useFlagLocations: () => ({
    data: { locations: [], flag },
    isPending: false,
    isError: false,
  }),
  useFlagHistory: () => ({ data: [], isPending: false, isError: false }),
}))
const flag: FeatureFlag = {
  key: "rota.templates",
  name: "Rota templates",
  description: "Create and apply saved templates.",
  mode: "off",
  revision: 4,
  overrideCount: 1,
  updatedAt: null,
}
beforeEach(() => {
  vi.clearAllMocks()
  flagsQuery.mockReturnValue({
    data: { flags: [flag] },
    isPending: false,
    isError: false,
  })
  locationQuery.mockReturnValue({
    data: {
      locationName: "Harbour House",
      flags: [
        {
          flag,
          override: "enabled",
          effective: { enabled: false, source: "global_off" },
        },
      ],
    },
    isPending: false,
    isError: false,
  })
})
it("shows a supported catalogue and sends explicit global modes", () => {
  const { render, screen, fireEvent } = testing
  render(<FeatureFlagsPage />)
  expect(screen.queryByRole("button", { name: "Create flag" })).toBeNull()
  fireEvent.change(
    screen.getByRole("combobox", { name: "Global setting for Rota templates" }),
    { target: { value: "selected" } }
  )
  expect(globalChange).toHaveBeenCalledWith({
    key: "rota.templates",
    mode: "selected",
    expectedRevision: 4,
    reason: "",
  })
})
it("explains a global disable even when a location prefers enabled, and can restore inheritance", () => {
  const { render, screen, fireEvent } = testing
  render(
    <LocationFeatureFlags locationId="00000000-0000-4000-8000-000000000001" />
  )
  fireEvent.click(screen.getByRole("button", { name: "Feature access" }))
  expect(screen.getByText("Disabled · off everywhere")).toBeTruthy()
  fireEvent.change(
    screen.getByRole("combobox", {
      name: "Location setting for Rota templates",
    }),
    { target: { value: "inherit" } }
  )
  expect(locationChange).toHaveBeenCalledWith({
    key: "rota.templates",
    locationId: "00000000-0000-4000-8000-000000000001",
    override: "inherit",
    expectedRevision: 4,
    reason: "",
  })
})

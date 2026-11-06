import { expect, it, vi } from "vitest"
import type { OrganizationRole } from "@/lib/auth/permissions"
import "@/routes/_authed/_verified/app/$workspaceSlug/settings/permissions"

type GuardInput = {
  context: { viewer: { activeRole: OrganizationRole | null } }
  params: { workspaceSlug: string }
}
const mocks = vi.hoisted(() => ({
  beforeLoad: (_input: GuardInput): void => {},
}))
vi.mock("@tanstack/react-router", () => ({
  createFileRoute:
    () => (options: { beforeLoad: (input: GuardInput) => void }) => {
      mocks.beforeLoad = options.beforeLoad
      return {}
    },
  redirect: () => new Error("Redirected away from permissions"),
  useLocation: vi.fn(),
}))
vi.mock("@/features/settings/components/permissions-page", () => ({
  PermissionsPage: vi.fn(),
}))
vi.mock("@/features/settings/components/settings-layout", () => ({
  SettingsLayout: vi.fn(),
}))

it.each([
  "admin",
  "manager",
  "supervisor",
  "employee",
  "member",
  null,
] as const)("blocks direct permissions-page navigation for %s", (role) => {
  expect(() =>
    mocks.beforeLoad({
      context: { viewer: { activeRole: role } },
      params: { workspaceSlug: "org" },
    })
  ).toThrow("Redirected away")
})
it("allows an owner to open the permissions page", () => {
  expect(() =>
    mocks.beforeLoad({
      context: { viewer: { activeRole: "owner" } },
      params: { workspaceSlug: "org" },
    })
  ).not.toThrow()
})

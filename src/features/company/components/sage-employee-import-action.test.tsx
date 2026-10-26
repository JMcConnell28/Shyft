import { renderToStaticMarkup } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { expect, it, vi } from "vitest"
import { companyQueryKeys } from "../query-keys"
import { SageEmployeeImportAction } from "./sage-employee-import-action"

vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }))
vi.mock("../server-fns", () => ({ getSageEmployeeImportAvailability: vi.fn() }))
vi.mock("./sage-employee-import-dialog", () => ({
  SageEmployeeImportDialog: () => <button>Import Sage employees</button>,
}))
const scope = { organizationId: "business", userId: "admin" }
function renderAvailability(enabled?: boolean) {
  const client = new QueryClient()
  if (enabled !== undefined)
    client.setQueryData(companyQueryKeys.sageImportAccess(scope), enabled)
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <SageEmployeeImportAction {...scope} employees={[]} />
    </QueryClientProvider>
  )
  client.clear()
  return html
}
it("hides import controls while flags load or imports are disabled", () => {
  expect(renderAvailability()).not.toContain("Import Sage employees")
  expect(renderAvailability(false)).not.toContain("Import Sage employees")
})
it("shows import controls when the workspace is enabled", () => {
  expect(renderAvailability(true)).toContain("Import Sage employees")
})

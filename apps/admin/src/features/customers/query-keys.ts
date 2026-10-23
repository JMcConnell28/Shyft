import type { CustomerListInput } from "./schemas"

const customersQueryKeys = {
  all: ["customers"] as const,
  list: (input: CustomerListInput) => ["customers", "list", input] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
  tags: (id: string) => ["customers", "tags", id] as const,
  queue: ["customers", "station-queue"] as const,
  count: ["customers", "station-count"] as const,
}
export { customersQueryKeys }

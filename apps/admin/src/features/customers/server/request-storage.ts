import "@tanstack/react-start/server-only"
import { stationRequestIdSchema } from "../schemas"

function getRequestStorage(requestId: string) {
  const parsed = stationRequestIdSchema.parse(requestId)
  const [source, id] = parsed.split(":")
  // Only these constants are interpolated in SQL; IDs remain query parameters.
  return source === "included"
    ? {
        table: "billing_private.location_hardware_entitlements",
        key: "location_id",
        id,
      }
    : { table: "billing_private.clock_station_purchases", key: "id", id }
}
export { getRequestStorage }

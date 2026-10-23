import { describe, expect, it } from "vitest"
import { validateFulfillmentTransition } from "./fulfillment"

const ready = {
  currentStatus: "pending",
  needsStation: true,
  hasTag: true,
  hasAddress: true,
}
describe("internal station fulfilment", () => {
  it("requires a qualifying payment before preparing or dispatching", () => {
    expect(() =>
      validateFulfillmentTransition({ ...ready, needsStation: false }, "ready")
    ).toThrow("confirmed payment")
    expect(() =>
      validateFulfillmentTransition(
        { ...ready, currentStatus: "ready", needsStation: false },
        "shipped"
      )
    ).toThrow("confirmed payment")
  })
  it("requires NFC setup and a full delivery address", () => {
    expect(() =>
      validateFulfillmentTransition({ ...ready, hasTag: false }, "ready")
    ).toThrow("NFC tag")
    expect(() =>
      validateFulfillmentTransition({ ...ready, hasAddress: false }, "ready")
    ).toThrow("delivery address")
  })
  it("requires setup before dispatch, and preserves completed shipments", () => {
    expect(() => validateFulfillmentTransition(ready, "shipped")).toThrow(
      "step"
    )
    expect(() =>
      validateFulfillmentTransition(
        { ...ready, currentStatus: "delivered" },
        "pending"
      )
    ).toThrow("step")
  })
  it("allows the internal workflow and recording delivery after cancellation", () => {
    expect(() => validateFulfillmentTransition(ready, "ready")).not.toThrow()
    expect(() =>
      validateFulfillmentTransition(
        { ...ready, currentStatus: "ready" },
        "shipped"
      )
    ).not.toThrow()
    expect(() =>
      validateFulfillmentTransition(
        { ...ready, currentStatus: "shipped", needsStation: false },
        "delivered"
      )
    ).not.toThrow()
  })
})

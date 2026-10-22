import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { RootErrorState } from "./root-error-state"

describe("route errors after the Start migration", () => {
  it.each([undefined, null, false, new Response(null, { status: 503 })])(
    "renders a useful fallback for a thrown value without a message: %s",
    (error) => {
      const markup = renderToStaticMarkup(
        <RootErrorState error={error} reset={vi.fn()} />
      )

      expect(markup).toContain("Please try again or reload the page.")
      expect(markup).toContain("Try again")
    }
  )

  it("keeps actionable error messages", () => {
    const markup = renderToStaticMarkup(
      <RootErrorState
        error={new Error("You do not have permission to open this rota.")}
        reset={vi.fn()}
      />
    )

    expect(markup).toContain("You do not have permission to open this rota.")
  })
})

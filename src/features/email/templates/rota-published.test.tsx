import { render, toPlainText } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { RotaPublishedEmail } from "@/features/email/templates/rota-published"

const props = {
  brandLogoUrl: "https://example.com/pwa/icon-192.png",
  helpUrl: "https://example.com/help",
  locationName: "The Harbour Bar",
  rotaUrl: "https://example.com/app/harbour/rota/bar/123/view",
  shiftSwapsEnabled: true,
  weekStart: "2025-09-29",
  shifts: [
    {
      dayDate: "2025-09-29",
      durationMinutes: 360,
      timeLabel: "17:00 – 23:00",
      zoneName: "Bar",
    },
    {
      dayDate: "2025-10-01",
      durationMinutes: 330,
      timeLabel: "18:00 – 23:30",
      zoneName: "Floor",
    },
  ],
}

describe("RotaPublishedEmail", () => {
  it("renders the full week without the illustration or slogan", async () => {
    const html = await render(<RotaPublishedEmail {...props} />)
    const content = toPlainText(html)

    expect(content).toContain("YOUR ROTA HAS BEEN PUBLISHED")
    expect(content).toContain("The Harbour Bar")
    expect(content).toContain("Mon 29 Sep – Sun 5 Oct 2025")
    expect(content).toContain("11.5 hours")
    expect(content).toContain("Mon 29 Sep")
    expect(content).toContain("Tue 30 Sep")
    expect(content).toContain("Off")
    expect(content).toContain("18:00 – 23:30")
    expect(content).toContain("Need to swap or can't work a shift?")
    expect(html).toContain(props.brandLogoUrl)
    expect(html).toContain(props.rotaUrl)
    expect(html).toContain(props.helpUrl)
    expect(html).not.toContain("email-verification.png")
    expect(content).not.toContain("People. Shifts. Simplified.")
    expect(Buffer.byteLength(html, "utf8")).toBeLessThan(90 * 1024)
  })

  it("omits swap guidance when shift swapping is disabled", async () => {
    const html = await render(
      <RotaPublishedEmail {...props} shiftSwapsEnabled={false} />
    )

    expect(toPlainText(html)).not.toContain("Need to swap")
  })
})

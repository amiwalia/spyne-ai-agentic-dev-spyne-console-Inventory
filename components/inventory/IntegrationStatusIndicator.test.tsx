import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { IntegrationStatusIndicator, statusColor, summaryText } from "./IntegrationStatusIndicator"
import type { UatPartnerStatus } from "@/lib/uat-adapter"

const NOW = new Date("2026-09-10T12:00:00.000Z").getTime()
const HOUR = 60 * 60 * 1000

function partner(overrides: Partial<UatPartnerStatus> = {}): UatPartnerStatus {
  return { partnerId: "p1", partnerName: "VAuto", partnerLogo: null, lastReceivedAt: null, ...overrides }
}

describe("statusColor", () => {
  it("is muted gray while partners is still loading (undefined)", () => {
    expect(statusColor(undefined, NOW)).toBe("rgba(40,35,70,0.25)")
  })

  it("is red when every partner has never synced", () => {
    expect(statusColor([partner({ lastReceivedAt: null })], NOW)).toBe("rgb(192,38,26)")
  })

  it("is green when the freshest sync is within the last 24 hours", () => {
    const recent = new Date(NOW - 2 * HOUR).toISOString()
    expect(statusColor([partner({ lastReceivedAt: recent })], NOW)).toBe("rgb(10,124,74)")
  })

  it("is amber when the freshest sync is older than 24 hours", () => {
    const stale = new Date(NOW - 30 * HOUR).toISOString()
    expect(statusColor([partner({ lastReceivedAt: stale })], NOW)).toBe("rgb(178,94,0)")
  })

  it("uses the freshest partner when partners disagree", () => {
    const stale = new Date(NOW - 30 * HOUR).toISOString()
    const recent = new Date(NOW - 1 * HOUR).toISOString()
    const color = statusColor([partner({ partnerId: "a", lastReceivedAt: stale }), partner({ partnerId: "b", lastReceivedAt: recent })], NOW)
    expect(color).toBe("rgb(10,124,74)")
  })
})

describe("summaryText", () => {
  it("shows a loading message while partners is undefined", () => {
    expect(summaryText(undefined)).toBe("Checking sync status…")
  })

  it("shows 'Not yet synced' when no partner has ever received data", () => {
    expect(summaryText([partner({ lastReceivedAt: null })])).toBe("Not yet synced")
  })

  it("formats the freshest partner's timestamp", () => {
    expect(summaryText([partner({ lastReceivedAt: "2026-09-03T10:45:00.000Z" })])).toBe("Last synced: 3 Sep '26, 10:45 AM")
  })
})

describe("IntegrationStatusIndicator", () => {
  it("lists every partner by name with its own status on hover", async () => {
    const user = userEvent.setup()
    render(
      <IntegrationStatusIndicator
        partners={[
          partner({ partnerId: "a", partnerName: "VAuto", lastReceivedAt: "2026-09-03T10:45:00.000Z" }),
          partner({ partnerId: "b", partnerName: "Autograph/EVN", lastReceivedAt: null }),
        ]}
      />,
    )

    await user.hover(screen.getByText(/Last synced/).parentElement!)

    expect(screen.getByText("VAuto")).toBeInTheDocument()
    expect(screen.getByText("Autograph/EVN")).toBeInTheDocument()
    expect(screen.getByText("Not connected yet")).toBeInTheDocument()
  })
})

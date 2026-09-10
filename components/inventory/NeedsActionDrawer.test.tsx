import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { NeedsActionDrawer } from "./NeedsActionDrawer"
import { makeVehicle } from "@/lib/test-fixtures"

const vehicles = [
  makeVehicle({ needsAction: { noPhotos: true, needsPromotion: false, notLiveYet: false } }),
  makeVehicle({ needsAction: { noPhotos: true, needsPromotion: false, notLiveYet: false } }),
]

async function openDrawer() {
  const user = userEvent.setup()
  await user.click(screen.getByText("Need Actions").closest("button")!)
}

/** The row's count sits in a <span> that's a direct child of the row's outer
 * div, alongside the label's own wrapper div and a chevron icon — scoping
 * to that div avoids ambiguity with the floating pill's own "N Vehicles"
 * text, which also renders the count as its own separate text node. */
function rowCountText(label: string) {
  const labelEl = screen.getByText(label)
  const row = labelEl.closest("div")!.parentElement!
  return row.querySelector(":scope > span")?.textContent
}

describe("NeedsActionDrawer — No Photos count", () => {
  it("counts the local vehicle sample when no real count is provided", async () => {
    render(<NeedsActionDrawer vehicles={vehicles} onSelectFilter={vi.fn()} />)
    await openDrawer()
    expect(rowCountText("No Photos")).toBe("2")
  })

  it("uses the real whole-account count instead of the local sample when provided", async () => {
    // The whole point: the local sample only has 2 vehicles flagged, but a
    // real rooftop can have far more than what's in the fetched sample.
    render(<NeedsActionDrawer vehicles={vehicles} onSelectFilter={vi.fn()} realNoPhotosCount={1264} />)
    await openDrawer()
    expect(rowCountText("No Photos")).toBe("1264")
  })

  it("falls back to the local count when realNoPhotosCount is explicitly undefined", async () => {
    render(<NeedsActionDrawer vehicles={vehicles} onSelectFilter={vi.fn()} realNoPhotosCount={undefined} />)
    await openDrawer()
    expect(rowCountText("No Photos")).toBe("2")
  })
})

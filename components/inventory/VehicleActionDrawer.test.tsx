import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { VehicleActionDrawer } from "./VehicleActionDrawer"
import { makeVehicle } from "@/lib/test-fixtures"

function renderDrawer() {
  const vehicle = makeVehicle({
    year: 2019,
    make: "Chevrolet",
    model: "Malibu",
    needsAction: { noPhotos: true, needsPromotion: true, notLiveYet: true },
  })
  const onResolve = vi.fn()
  const onApplyPrice = vi.fn()
  const onClose = vi.fn()
  render(<VehicleActionDrawer vehicle={vehicle} onClose={onClose} onResolve={onResolve} onApplyPrice={onApplyPrice} />)
  return { vehicle, onResolve, onApplyPrice, onClose }
}

function fixNowButtonFor(label: string) {
  return screen.getByText(label).closest("div")!.querySelector("button")!
}

describe("VehicleActionDrawer — Vehicle Journey panel", () => {
  it("titles the panel 'Vehicle Journey', not 'Vehicle process'", () => {
    renderDrawer()
    expect(screen.getByText("Vehicle Journey")).toBeInTheDocument()
    expect(screen.queryByText("Vehicle process")).not.toBeInTheDocument()
  })

  it("renders one Fix now button per pending checklist issue", () => {
    renderDrawer()
    expect(screen.getByText("Photo score")).toBeInTheDocument()
    expect(screen.getByText("Website listing")).toBeInTheDocument()
    expect(screen.getByText("Promotion")).toBeInTheDocument()
    expect(screen.getAllByText("Fix now")).toHaveLength(3)
  })

  it("resolving one issue calls onResolve with only that issue's key", async () => {
    // Regression test: this used to be a single shared button at the bottom
    // of the checklist that resolved every pending issue at once.
    const user = userEvent.setup()
    const { vehicle, onResolve } = renderDrawer()

    await user.click(fixNowButtonFor("Website listing"))

    expect(onResolve).toHaveBeenCalledTimes(1)
    expect(onResolve).toHaveBeenCalledWith(vehicle.id, "notLiveYet")
  })

  it("resolving 'Website listing' does not also resolve 'Promotion'", async () => {
    const user = userEvent.setup()
    const { onResolve } = renderDrawer()

    await user.click(fixNowButtonFor("Website listing"))

    expect(onResolve).not.toHaveBeenCalledWith(expect.anything(), "needsPromotion")
    expect(onResolve).not.toHaveBeenCalledWith(expect.anything(), "noPhotos")
  })

  it("fixing 'Photo score' opens the Photo Score modal instead of resolving directly", async () => {
    const user = userEvent.setup()
    const { onResolve } = renderDrawer()

    await user.click(fixNowButtonFor("Photo score"))

    expect(onResolve).not.toHaveBeenCalled()
    expect(screen.getByText("Action Required")).toBeInTheDocument()
  })

  it("fixing the photo score from inside the modal does resolve it", async () => {
    const user = userEvent.setup()
    const { vehicle, onResolve } = renderDrawer()

    await user.click(fixNowButtonFor("Photo score"))
    await user.click(screen.getByText("Fix with Studio AI"))

    expect(onResolve).toHaveBeenCalledWith(vehicle.id, "noPhotos")
  })
})

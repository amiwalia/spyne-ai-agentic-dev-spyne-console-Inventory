import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { VehicleActionDrawer } from "./VehicleActionDrawer"
import { makeVehicle } from "@/lib/test-fixtures"

beforeEach(() => {
  // The drawer fetches real photo-score data on mount — stub it so tests
  // exercise the needsAction-derived fallback path deterministically,
  // without a real (and unmocked) network call from the test environment.
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ photoScore: null }) }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

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

describe("VehicleActionDrawer — real photo score", () => {
  it("shows the real score, grade, and action items once the fetch resolves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          photoScore: {
            score: 5,
            grade: "POOR",
            issues: [{ key: "OTHER_IMAGES", label: "Other Images", actual: 0, target: 5 }],
          },
        }),
      }),
    )
    const user = userEvent.setup()
    renderDrawer()

    await user.click(fixNowButtonFor("Photo score"))

    expect(await screen.findByText("POOR")).toBeInTheDocument()
    expect(screen.getByText("Other Images")).toBeInTheDocument()
    expect(screen.getByText("0/5")).toBeInTheDocument()
  })

  it("falls back to the needsAction-derived estimate if the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))
    const user = userEvent.setup()
    renderDrawer()

    await user.click(fixNowButtonFor("Photo score"))

    // Same fallback content the default-mocked describe block above checks.
    expect(await screen.findByText("Action Required")).toBeInTheDocument()
  })
})

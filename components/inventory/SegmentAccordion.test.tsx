import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { SegmentAccordion } from "./SegmentAccordion"
import { makeVehicle } from "@/lib/test-fixtures"
import type { SegmentDaysSupply } from "@/lib/types"

const segments: SegmentDaysSupply[] = [
  { bodyType: "SUV", vehicleCount: 1, avgDaysSupply: 72, status: "overstocked" },
  { bodyType: "Sedan", vehicleCount: 1, avgDaysSupply: 38, status: "on_target" },
]

const vehicles = [
  makeVehicle({ bodyType: "SUV", make: "Hyundai", model: "Tucson", stockNumber: "STK-SUV-1" }),
  makeVehicle({ bodyType: "Sedan", make: "Toyota", model: "Camry", stockNumber: "STK-SEDAN-1" }),
]

describe("SegmentAccordion", () => {
  it("renders one row per segment, collapsed by default", () => {
    render(<SegmentAccordion segments={segments} vehicles={vehicles} />)
    expect(screen.getByText("SUV")).toBeInTheDocument()
    expect(screen.getByText("Sedan")).toBeInTheDocument()
    expect(screen.queryByText(/Hyundai Tucson/)).not.toBeInTheDocument()
  })

  it("expands a segment on a single click", async () => {
    // Regression test: this was double-click-only until user feedback that
    // double-click wasn't discoverable, then changed to single-click.
    const user = userEvent.setup()
    render(<SegmentAccordion segments={segments} vehicles={vehicles} />)

    await user.click(screen.getByText("SUV"))

    expect(screen.getByText(/Hyundai Tucson/)).toBeInTheDocument()
    expect(screen.queryByText(/Toyota Camry/)).not.toBeInTheDocument()
  })

  it("tracks each segment's expanded state independently", async () => {
    const user = userEvent.setup()
    render(<SegmentAccordion segments={segments} vehicles={vehicles} />)

    await user.click(screen.getByText("SUV"))
    await user.click(screen.getByText("Sedan"))

    expect(screen.getByText(/Hyundai Tucson/)).toBeInTheDocument()
    expect(screen.getByText(/Toyota Camry/)).toBeInTheDocument()
  })

  it("collapses a segment on a second click", async () => {
    const user = userEvent.setup()
    render(<SegmentAccordion segments={segments} vehicles={vehicles} />)

    const suvRow = screen.getByText("SUV")
    await user.click(suvRow)
    expect(screen.getByText(/Hyundai Tucson/)).toBeInTheDocument()

    await user.click(suvRow)
    expect(screen.queryByText(/Hyundai Tucson/)).not.toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SupplyStatusBadge, SUPPLY_STATUS_META } from "./SupplyStatusBadge"

describe("SupplyStatusBadge", () => {
  it("labels overstocked as 'Overstocked'", () => {
    render(<SupplyStatusBadge status="overstocked" />)
    expect(screen.getByText("Overstocked")).toBeInTheDocument()
  })

  it("labels understocked as 'Short Supply', not the raw enum value", () => {
    // The UI label intentionally differs from the DaysSupplyStatus type value
    // ("understocked") — this guards the mapping, not just the component.
    render(<SupplyStatusBadge status="understocked" />)
    expect(screen.getByText("Short Supply")).toBeInTheDocument()
    expect(screen.queryByText("understocked")).not.toBeInTheDocument()
  })

  it("labels on_target as 'On Target'", () => {
    render(<SupplyStatusBadge status="on_target" />)
    expect(screen.getByText("On Target")).toBeInTheDocument()
  })

  it("defines a label for every status the type allows", () => {
    for (const status of ["on_target", "overstocked", "understocked"] as const) {
      expect(SUPPLY_STATUS_META[status].label).toBeTruthy()
    }
  })
})

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { DealerScopeToggle } from "./DealerScopeToggle"

describe("DealerScopeToggle", () => {
  it("defaults to Rooftop active", () => {
    render(<DealerScopeToggle />)
    const rooftop = screen.getByText("Rooftop")
    expect(rooftop).toHaveStyle({ color: "rgb(70, 0, 242)" })
  })

  it("switches the active segment on click", async () => {
    const user = userEvent.setup()
    render(<DealerScopeToggle />)

    await user.click(screen.getByText("Group Dealer"))

    expect(screen.getByText("Group Dealer")).toHaveStyle({ color: "rgb(70, 0, 242)" })
    expect(screen.getByText("Rooftop")).not.toHaveStyle({ color: "rgb(70, 0, 242)" })
  })
})

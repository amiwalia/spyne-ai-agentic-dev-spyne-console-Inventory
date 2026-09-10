import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FilterBar } from "./FilterBar"

function renderBar() {
  render(
    <FilterBar
      search=""
      onSearchChange={vi.fn()}
      active={new Set()}
      onToggle={vi.fn()}
      onExport={vi.fn()}
      onOpenFilters={vi.fn()}
      activeAdvancedCount={0}
      onSelectPreset={vi.fn()}
    />,
  )
}

describe("FilterBar", () => {
  it("shows View Sold Inventory alongside the other filter controls", () => {
    renderBar()
    expect(screen.getByText("View Sold Inventory")).toBeInTheDocument()
  })

  it("does not render a standalone Source dropdown", () => {
    // Regression test: this was a non-functional duplicate of the working
    // Source filter already inside the Filters panel, and was removed.
    renderBar()
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  })

  it("still renders the quick filter chips", () => {
    renderBar()
    expect(screen.getByText("Aging 60+")).toBeInTheDocument()
    expect(screen.getByText("Aging 40+")).toBeInTheDocument()
    expect(screen.getByText("No photos")).toBeInTheDocument()
    expect(screen.getByText("Overstocked")).toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Pagination, buildPageWindow } from "./Pagination"

describe("buildPageWindow", () => {
  it("shows every page when there are few enough of them", () => {
    expect(buildPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(buildPageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("windows around the current page with ellipses on both sides", () => {
    // Regression case: this exact shape (125 pages, mid-range current page)
    // is what a real ~1000-vehicle rooftop at page size 8 produces — the
    // bug this fix addresses was rendering all 125 page buttons directly.
    expect(buildPageWindow(60, 125)).toEqual([1, "ellipsis", 59, 60, 61, "ellipsis", 125])
  })

  it("omits the left ellipsis when the current page is near the start", () => {
    expect(buildPageWindow(2, 125)).toEqual([1, 2, 3, "ellipsis", 125])
  })

  it("omits the right ellipsis when the current page is near the end", () => {
    expect(buildPageWindow(124, 125)).toEqual([1, "ellipsis", 123, 124, 125])
  })

  it("always includes the first and last page even for very large page counts", () => {
    const window_ = buildPageWindow(500, 1000)
    expect(window_[0]).toBe(1)
    expect(window_[window_.length - 1]).toBe(1000)
    expect(window_.length).toBeLessThan(10)
  })

  it("never renders more than a handful of elements regardless of total pages", () => {
    for (const totalPages of [10, 50, 125, 1000, 9060]) {
      for (const page of [1, Math.ceil(totalPages / 2), totalPages]) {
        expect(buildPageWindow(page, totalPages).length).toBeLessThanOrEqual(7)
      }
    }
  })
})

describe("Pagination", () => {
  it("renders the current range and total", () => {
    render(<Pagination page={2} pageSize={8} total={20} onPageChange={vi.fn()} />)
    expect(screen.getByText("Showing 9–16 of 20 vehicles")).toBeInTheDocument()
  })

  it("does not render a button for every page at real-world scale", () => {
    // The actual bug: 1000 vehicles at page size 8 is 125 pages.
    render(<Pagination page={1} pageSize={8} total={1000} onPageChange={vi.fn()} />)
    const pageButtons = screen.getAllByRole("button").filter((b) => /^\d+$/.test(b.textContent ?? ""))
    expect(pageButtons.length).toBeLessThan(10)
  })

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(<Pagination page={1} pageSize={8} total={100} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText("Previous page")).toBeDisabled()
    expect(screen.getByLabelText("Next page")).not.toBeDisabled()

    rerender(<Pagination page={13} pageSize={8} total={100} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText("Next page")).toBeDisabled()
  })

  it("calls onPageChange with the clicked page number", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={1} pageSize={8} total={100} onPageChange={onPageChange} />)

    await user.click(screen.getByText("2"))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("calls onPageChange with page+1 when Next is clicked", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} pageSize={8} total={100} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText("Next page"))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})

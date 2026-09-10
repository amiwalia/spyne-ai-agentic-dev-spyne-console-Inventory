import "@testing-library/jest-dom/vitest"
import React from "react"
import { vi } from "vitest"

// next/link renders fine standalone, but mocking it to a plain <a> keeps
// component tests from depending on Next's App Router context.
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.PropsWithChildren<{ href: string }>) =>
    React.createElement("a", { href, ...props }, children),
}))

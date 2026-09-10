import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AddVehicleModal, styleToBodyType } from "./AddVehicleModal"

describe("styleToBodyType", () => {
  it("maps recognizable VIN-decoder style strings onto the app's body types", () => {
    expect(styleToBodyType("COUPE 2-DR")).toBe("Sport Coupe")
    expect(styleToBodyType("SPORT UTILITY 4-DR")).toBe("SUV")
    expect(styleToBodyType("PICKUP 4-DR")).toBe("Truck")
    expect(styleToBodyType("MINIVAN 4-DR")).toBe("Minivan")
    expect(styleToBodyType("SEDAN 4-DR")).toBe("Sedan")
  })

  it("is case-insensitive", () => {
    expect(styleToBodyType("coupe 2-dr")).toBe("Sport Coupe")
  })

  it("returns null for an unrecognized style rather than guessing", () => {
    expect(styleToBodyType("SOME UNKNOWN STYLE")).toBeNull()
  })

  it("returns null for a missing style", () => {
    expect(styleToBodyType(null)).toBeNull()
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("AddVehicleModal — VIN decode", () => {
  it("auto-fills year, make, model, and body type on a successful decode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ year: 2003, make: "Honda", model: "Accord", trim: "EX V6", style: "COUPE 2-DR", engine: "V6" }),
      }),
    )
    const user = userEvent.setup()
    render(<AddVehicleModal open onClose={vi.fn()} onAdd={vi.fn()} />)

    await user.type(screen.getByPlaceholderText("VIN..."), "1HGCM82633A004352")
    await user.click(screen.getByText("Decode"))

    expect(await screen.findByDisplayValue("Honda")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Accord")).toBeInTheDocument()
    expect(screen.getByDisplayValue("2003")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Sport Coupe")).toBeInTheDocument()
  })

  it("shows the real error message inline on an invalid VIN, without crashing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "VIN must be valid." }) }),
    )
    const user = userEvent.setup()
    render(<AddVehicleModal open onClose={vi.fn()} onAdd={vi.fn()} />)

    await user.type(screen.getByPlaceholderText("VIN..."), "NOTAVALIDVIN")
    await user.click(screen.getByText("Decode"))

    expect(await screen.findByText("VIN must be valid.")).toBeInTheDocument()
  })

  it("disables Decode until a VIN is entered", () => {
    render(<AddVehicleModal open onClose={vi.fn()} onAdd={vi.fn()} />)
    expect(screen.getByText("Decode").closest("button")).toBeDisabled()
  })

  it("clears a previous decode error as soon as the VIN is edited", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "VIN must be valid." }) }))
    const user = userEvent.setup()
    render(<AddVehicleModal open onClose={vi.fn()} onAdd={vi.fn()} />)

    const vinInput = screen.getByPlaceholderText("VIN...")
    await user.type(vinInput, "BADVIN")
    await user.click(screen.getByText("Decode"))
    expect(await screen.findByText("VIN must be valid.")).toBeInTheDocument()

    await user.type(vinInput, "X")
    expect(screen.queryByText("VIN must be valid.")).not.toBeInTheDocument()
  })
})

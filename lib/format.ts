export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}

export function formatMileage(miles: number): string {
  return `${miles.toLocaleString("en-US")} miles`
}

export function formatListedAt(iso: string): string {
  const d = new Date(iso)
  const month = d.toLocaleString("en-US", { month: "short" })
  const day = d.getDate()
  const year = d.getFullYear().toString().slice(2)
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${day} ${month} '${year}, ${hours}:${minutes} ${ampm}`
}

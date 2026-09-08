import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Inventory · Studio OS",
  description: "Studio OS Inventory — vehicle merchandising and aging dashboard.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

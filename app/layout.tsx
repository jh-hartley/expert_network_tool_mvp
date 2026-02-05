import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Helmsman - Expert Network Workflow Manager",
  description:
    "Standardise expert data, track calls and spend, and reduce admin overhead across expert network workstreams.",
}

export const viewport: Viewport = {
  themeColor: "#2c3340",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

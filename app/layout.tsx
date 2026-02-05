import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import TopNav from "@/components/top-nav"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Helmsman -- Expert Network Ops Hub",
  description:
    "Hackathon prototype scaffold for expert network operations management.",
}

export const viewport: Viewport = {
  themeColor: "#b5243a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <TopNav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-muted/40">
            <div className="mx-auto flex h-12 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
              <p className="text-xs text-muted-foreground">
                {"Helmsman v0.1 \u2014 scaffold"}
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

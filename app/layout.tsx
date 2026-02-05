import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Helmsman -- Expert Network Workflow Manager",
  description:
    "Standardise expert data, track calls and spend, and reduce admin overhead.",
}

export const viewport: Viewport = {
  themeColor: "#9e2336",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <header className="sticky top-0 z-50 border-b border-border bg-card">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
              <a href="/" className="text-sm font-semibold tracking-tight text-foreground">
                Helmsman
              </a>
              <nav className="flex items-center gap-1">
                {[
                  { href: "/dashboard", label: "Overview" },
                  { href: "/upload", label: "Upload" },
                  { href: "/experts", label: "Experts" },
                  { href: "/calls", label: "Calls" },
                  { href: "/ai-surveys", label: "AI Surveys" },
                  { href: "/search", label: "Search" },
                  { href: "/settings", label: "Settings" },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-card">
            <div className="mx-auto flex h-12 max-w-7xl items-center justify-center px-6">
              <p className="text-xs text-muted-foreground">
                {"Helmsman v0.1 \u2014 Expert Network Workflow Manager \u2014 prototype"}
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

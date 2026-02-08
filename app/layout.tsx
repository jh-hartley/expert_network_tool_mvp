import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import TopNav from "./components/top-nav"
import Footer from "./components/footer"
import ToastProvider from "./components/toast-provider"
import ErrorBoundary from "./components/error-boundary"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Consensus -- Expert Network Tool (Prototype)",
  description:
    "Hackathon prototype: manage expert networks, schedule calls, run AI surveys, and maintain compliance. All data is fictional.",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
      <body className="flex min-h-screen flex-col font-sans">
        <ErrorBoundary>
          <TopNav />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  )
}

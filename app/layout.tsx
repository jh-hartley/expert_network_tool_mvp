import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import TopNav from "./components/top-nav"
import Footer from "./components/footer"
import ToastProvider from "./components/toast-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Helmsman -- Expert Network Tool",
  description:
    "Manage expert networks, schedule calls, run AI surveys, and maintain compliance with a Bain-grade professional interface.",
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
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastProvider />
      </body>
    </html>
  )
}

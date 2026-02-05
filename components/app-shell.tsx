import { TopNav } from "@/components/top-nav"
import { ToastProvider } from "@/components/toast"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <TopNav />
      <main className="mx-auto max-w-screen-xl px-6 py-8">{children}</main>
    </ToastProvider>
  )
}

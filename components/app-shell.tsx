import { TopNav } from "@/components/top-nav"
import { StorageInitializer } from "@/components/storage-initializer"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StorageInitializer />
      <TopNav />
      <main className="mx-auto max-w-screen-xl px-4 py-6">{children}</main>
    </>
  )
}

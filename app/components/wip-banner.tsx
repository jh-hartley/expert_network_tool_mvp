import { Construction } from "lucide-react"

interface WipBannerProps {
  /** A short identifier like "upload" so banners can be removed individually */
  feature: string
}

/**
 * A dismissible (per-session) work-in-progress banner.
 * Remove the component from a page once the feature is implemented.
 */
export default function WipBanner({ feature }: WipBannerProps) {
  void feature // reserved for future per-feature dismiss logic
  return (
    <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <Construction className="h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-sm leading-relaxed text-amber-800">
        <span className="font-medium">Work in progress</span>{" "}
        <span className="text-amber-700">
          -- this page is under active development and may not yet function as
          described.
        </span>
      </p>
    </div>
  )
}

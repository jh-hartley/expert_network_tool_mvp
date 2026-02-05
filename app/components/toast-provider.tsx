"use client"

import { Toaster } from "sonner"

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "text-sm font-sans",
        style: {
          borderRadius: "var(--radius)",
        },
      }}
    />
  )
}

"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  /** Tailwind max-w class. Defaults to "max-w-md" */
  maxWidth?: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, description, maxWidth = "max-w-md", children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={`m-auto w-full ${maxWidth} rounded-lg border border-border bg-card p-0 shadow-lg backdrop:bg-foreground/20 backdrop:backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  )
}

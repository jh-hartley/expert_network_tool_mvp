"use client"

import { useEffect, useState, createContext, useContext, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "default" | "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-card text-foreground",
  success: "border-success/30 bg-card text-foreground",
  error: "border-destructive/30 bg-card text-foreground",
  info: "border-primary/30 bg-card text-foreground",
}

const variantIcons: Record<ToastVariant, typeof CheckCircle2> = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const iconStyles: Record<ToastVariant, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  error: "text-destructive",
  info: "text-primary",
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = variantIcons[t.variant]

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), 4000)
    return () => clearTimeout(timer)
  }, [t.id, onDismiss])

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm animate-in fade-in slide-in-from-bottom-2",
        variantStyles[t.variant]
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", iconStyles[t.variant])} />
      <span className="flex-1 text-sm">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = "default") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

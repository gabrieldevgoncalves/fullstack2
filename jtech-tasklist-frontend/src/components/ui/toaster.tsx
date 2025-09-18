// src/lib/toaster.ts
export type ToastVariant = 'default' | 'success' | 'destructive' | 'info'

export type Toaster = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number // ms (padrão 4000)
}

type Listener = (toasts: Toaster[]) => void

const listeners = new Set<Listener>()
let toasts: Toaster[] = []

function emit() {
  const snapshot = [...toasts]
  listeners.forEach((l) => l(snapshot))
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  // envia estado atual imediatamente
  listener([...toasts])
  return () => listeners.delete(listener)
}

function genId(): string {
  // compatível com browsers antigos
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

export function toast(input: Omit<Toaster, 'id'>): string {
  const id = genId()
  const item: Toaster = { id, duration: 4000, ...input }
  toasts = [...toasts, item]
  emit()

  if (item.duration && item.duration > 0) {
    setTimeout(() => dismiss(id), item.duration)
  }
  return id
}

export function dismiss(id: string): void {
  const next = toasts.filter((t) => t.id !== id)
  if (next.length !== toasts.length) {
    toasts = next
    emit()
  }
}

export function clear(): void {
  if (toasts.length) {
    toasts = []
    emit()
  }
}

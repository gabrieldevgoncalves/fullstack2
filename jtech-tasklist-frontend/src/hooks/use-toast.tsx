export type ToastOptions = {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'destructive' | 'info'
}

export function toast(opts: ToastOptions) {
  console.log('[toast]', opts.title ?? '', opts.description ?? '', opts.variant ?? 'default')
}

export function useToast() {
  return { toast }
}

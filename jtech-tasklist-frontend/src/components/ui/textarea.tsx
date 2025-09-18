'use client'
import * as React from 'react'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={[
        'w-full rounded-md border border-gray-300 bg-white px-3 py-2',
        'text-sm outline-none placeholder:text-gray-400',
        'focus-visible:ring-2 focus-visible:ring-black/10',
        className,
      ].join(' ')}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
export default Textarea

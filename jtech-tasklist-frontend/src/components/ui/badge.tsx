'use client'
import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-900 text-white',
  secondary: 'bg-gray-100 text-gray-900',
  destructive: 'bg-red-600 text-white',
  outline: 'border border-gray-300 text-gray-700',
}

const Badge = ({ className = '', variant = 'default', ...props }: BadgeProps) => (
  <span
    className={[
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
      variants[variant],
      className,
    ].join(' ')}
    {...props}
  />
)

export { Badge }
export default Badge

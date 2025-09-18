'use client'
import * as React from 'react'

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement>

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={['overflow-auto', className].join(' ')} {...props} />
  ),
)
ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }
export default ScrollArea

'use client'
import * as React from 'react'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onCheckedChange, label, className = '', ...rest }, ref) => (
    <label className={['inline-flex items-center gap-2', className].join(' ')}>
      <input
        ref={ref}
        type="checkbox"
        className="h-4 w-4 rounded border border-gray-300"
        checked={!!checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange?.(e.target.checked)}
        {...rest}
      />
      {label ? <span className="text-sm text-gray-700">{label}</span> : null}
    </label>
  ),
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
export default Checkbox

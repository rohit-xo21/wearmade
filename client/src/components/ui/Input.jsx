import React from 'react'
import { clsx } from 'clsx'

const Input = React.forwardRef(({ 
  className, 
  type = 'text',
  error,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={clsx(
        'flex h-10 w-full rounded-xl border border-[#d8cdbd] bg-[#faf8f4] px-3 py-2 text-sm text-[#1a1814] placeholder:text-[#9f968c] focus:outline-none focus:ring-2 focus:ring-[#c8a97e] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
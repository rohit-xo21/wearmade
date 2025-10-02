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
        'flex h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
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
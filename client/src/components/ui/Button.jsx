import React from 'react'
import { clsx } from 'clsx'

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    primary: 'bg-gray-900 text-white rounded-full hover:bg-gray-800 focus:ring-gray-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white focus:ring-gray-900',
    outline: 'border border-gray-300 text-gray-700 rounded-full hover:border-gray-900 hover:text-gray-900 focus:ring-gray-900',
    ghost: 'text-gray-700 rounded-full hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-gray-900 underline-offset-4 hover:underline focus:ring-gray-900 rounded-none',
    danger: 'bg-red-600 text-white rounded-full hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
    icon: 'p-3'
  }

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }
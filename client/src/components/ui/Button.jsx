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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tracking-[0.01em]'
  
  const variants = {
    primary: 'bg-[#1a1814] text-white rounded-xl hover:bg-[#2a2722] focus:ring-[#1a1814] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'border border-[#1a1814] text-[#1a1814] rounded-xl hover:bg-[#1a1814] hover:text-white focus:ring-[#1a1814]',
    outline: 'border border-[#d8cdbd] text-[#5d5145] rounded-xl hover:border-[#1a1814] hover:text-[#1a1814] hover:bg-[#f5f1eb] focus:ring-[#1a1814]',
    ghost: 'text-[#5d5145] rounded-xl hover:bg-[#f1ebe2] focus:ring-[#c8a97e]',
    link: 'text-gray-900 underline-offset-4 hover:underline focus:ring-gray-900 rounded-none',
    danger: 'bg-red-600 text-white rounded-xl hover:bg-red-700 focus:ring-red-500'
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
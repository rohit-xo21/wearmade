import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 * @param {...*} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Get relative time
 * @param {string|Date} date - Date to get relative time for
 * @returns {string} - Relative time string
 */
export function getRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = (past - now) / 1000
  const diffInMinutes = diffInSeconds / 60
  const diffInHours = diffInMinutes / 60
  const diffInDays = diffInHours / 24

  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(Math.round(diffInDays), 'day')
  } else if (Math.abs(diffInHours) >= 1) {
    return rtf.format(Math.round(diffInHours), 'hour')
  } else {
    return rtf.format(Math.round(diffInMinutes), 'minute')
  }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
export function validatePassword(password) {
  const minLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const strength = [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length

  return {
    isValid: strength >= 3,
    strength,
    requirements: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    }
  }
}

/**
 * File size formatter
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
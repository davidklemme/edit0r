'use client'

import { useState, useEffect } from 'react'

export function useDarkMode(initialDark: boolean = true) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Set class synchronously during initialization to avoid flash
    if (typeof document !== 'undefined') {
      if (initialDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    return initialDark
  })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev)

  return { isDarkMode, toggleDarkMode }
}

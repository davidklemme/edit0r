'use client'

import { useState } from 'react'
import { defaultLineBreakOptions } from '@/lib/utils'
import type { LineBreakOptions } from '@/lib/utils'

export function useLineBreakOptions() {
  const [lineBreakOptions, setLineBreakOptions] = useState<LineBreakOptions>(defaultLineBreakOptions)

  const resetOptions = () => setLineBreakOptions(defaultLineBreakOptions)

  return { lineBreakOptions, setLineBreakOptions, resetOptions }
}

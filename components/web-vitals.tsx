'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'
import { getLogger } from '@/lib/logger'

const logger = getLogger('WebVitals')

/**
 * Web Vitals tracking component
 * Measures and logs Core Web Vitals metrics
 *
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift): <0.1 good, <0.25 needs improvement
 * - FCP (First Contentful Paint): <1.8s good, <3s needs improvement
 * - LCP (Largest Contentful Paint): <2.5s good, <4s needs improvement
 * - TTFB (Time to First Byte): <800ms good, <1.8s needs improvement
 * - INP (Interaction to Next Paint): <200ms good, <500ms needs improvement (replaces FID)
 */
export default function WebVitals() {
  useEffect(() => {
    const reportMetric = (metric: Metric) => {
      const { name, value, rating } = metric

      // Log to browser console in development
      if (process.env.NODE_ENV === 'development') {
        const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
        console.log(`${emoji} ${name}: ${Math.round(value)}${name === 'CLS' ? '' : 'ms'} (${rating})`)
      }

      // Log using our logger for persistence
      logger.info(`Web Vital: ${name}`, {
        name,
        value: Math.round(value),
        rating,
        id: metric.id,
        navigationType: metric.navigationType,
      })

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Analytics integration point
        // Example: sendToAnalytics({ name, value, rating })

        // Send to Next.js Analytics if available
        if (window.performance && 'measure' in window.performance) {
          try {
            window.performance.measure(name, {
              detail: { value, rating },
            })
          } catch {
            // Ignore measurement errors
          }
        }
      }
    }

    // Register all Web Vitals listeners
    onCLS(reportMetric)
    onFCP(reportMetric)
    onLCP(reportMetric)
    onTTFB(reportMetric)
    onINP(reportMetric)
  }, [])

  // This component renders nothing
  return null
}

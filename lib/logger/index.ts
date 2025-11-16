import { BrowserLogger } from './browser-logger';
import type { Logger, LoggerConfig } from './types';

/**
 * Global logger instance
 * Use this throughout the application for consistent logging
 */
let globalLogger: Logger;

/**
 * Initialize the logger with configuration
 * Call this once at app startup
 */
export function initLogger(config?: Partial<LoggerConfig>): Logger {
  globalLogger = new BrowserLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableConsole: true,
    enableLocalStorage: process.env.NODE_ENV === 'production',
    maxStoredLogs: 100,
    ...config,
  });

  return globalLogger;
}

/**
 * Get the global logger instance
 * Creates a default logger if not initialized
 */
export function getLogger(context?: string): Logger {
  if (!globalLogger) {
    globalLogger = new BrowserLogger({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      enableConsole: true,
      enableLocalStorage: false,
    });
  }

  return context ? globalLogger.setContext(context) : globalLogger;
}

/**
 * Create a new logger instance with context
 */
export function createLogger(context: string, config?: Partial<LoggerConfig>): Logger {
  return new BrowserLogger(config).setContext(context);
}

// Re-export types and classes
export { BrowserLogger } from './browser-logger';
export type { Logger, LogLevel, LogEntry, LoggerConfig } from './types';

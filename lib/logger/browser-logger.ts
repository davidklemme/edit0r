import { Logger, LogEntry, LogLevel, LoggerConfig } from './types';

/**
 * Browser-safe logger implementation
 * Logs to console and optionally stores in localStorage for debugging
 */
export class BrowserLogger implements Logger {
  private context?: string;
  private config: LoggerConfig;
  private static readonly STORAGE_KEY = 'edit0r:logs';

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: config?.level ?? 'info',
      enableConsole: config?.enableConsole ?? true,
      enableLocalStorage: config?.enableLocalStorage ?? false,
      maxStoredLogs: config?.maxStoredLogs ?? 100,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
    };
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Console output
    if (this.config.enableConsole) {
      const prefix = entry.context ? `[${entry.context}]` : '';
      const logData = entry.data ? [entry.data] : [];

      switch (entry.level) {
        case 'debug':
          console.debug(`${prefix} ${entry.message}`, ...logData);
          break;
        case 'info':
          console.info(`${prefix} ${entry.message}`, ...logData);
          break;
        case 'warn':
          console.warn(`${prefix} ${entry.message}`, ...logData);
          break;
        case 'error':
          console.error(`${prefix} ${entry.message}`, ...logData);
          break;
      }
    }

    // localStorage storage (for debugging in production)
    if (this.config.enableLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = this.getStoredLogs();
        stored.push(entry);

        // Keep only last N logs
        const trimmed = stored.slice(-this.config.maxStoredLogs);
        localStorage.setItem(BrowserLogger.STORAGE_KEY, JSON.stringify(trimmed));
      } catch (error) {
        // Silently fail if localStorage is unavailable
        console.warn('Failed to store logs in localStorage:', error);
      }
    }
  }

  private getStoredLogs(): LogEntry[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(BrowserLogger.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.writeLog(this.createLogEntry('debug', message, data));
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.writeLog(this.createLogEntry('info', message, data));
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.writeLog(this.createLogEntry('warn', message, data));
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.writeLog(this.createLogEntry('error', message, data));
  }

  setContext(context: string): Logger {
    this.context = context;
    return this;
  }

  /**
   * Get all stored logs (for debugging)
   */
  static getStoredLogs(): LogEntry[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(BrowserLogger.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all stored logs
   */
  static clearStoredLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(BrowserLogger.STORAGE_KEY);
    }
  }
}

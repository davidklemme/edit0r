import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrowserLogger } from './browser-logger';

describe('BrowserLogger', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    BrowserLogger.clearStoredLogs();
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    BrowserLogger.clearStoredLogs();
  });

  describe('Basic Logging', () => {
    it('logs debug messages', () => {
      const logger = new BrowserLogger({ level: 'debug' });
      logger.debug('Test debug message');

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        ' Test debug message'
      );
    });

    it('logs info messages', () => {
      const logger = new BrowserLogger({ level: 'info' });
      logger.info('Test info message');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        ' Test info message'
      );
    });

    it('logs warn messages', () => {
      const logger = new BrowserLogger({ level: 'warn' });
      logger.warn('Test warn message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        ' Test warn message'
      );
    });

    it('logs error messages', () => {
      const logger = new BrowserLogger({ level: 'error' });
      logger.error('Test error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        ' Test error message'
      );
    });
  });

  describe('Log Levels', () => {
    it('respects log level - info skips debug', () => {
      const logger = new BrowserLogger({ level: 'info' });

      logger.debug('Should not log');
      logger.info('Should log');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('respects log level - warn skips debug and info', () => {
      const logger = new BrowserLogger({ level: 'warn' });

      logger.debug('Should not log');
      logger.info('Should not log');
      logger.warn('Should log');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('respects log level - error only', () => {
      const logger = new BrowserLogger({ level: 'error' });

      logger.debug('Should not log');
      logger.info('Should not log');
      logger.warn('Should not log');
      logger.error('Should log');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Context', () => {
    it('includes context in log messages', () => {
      const logger = new BrowserLogger({ level: 'info' });
      logger.setContext('TestContext');
      logger.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[TestContext] Test message'
      );
    });

    it('supports chaining setContext', () => {
      const logger = new BrowserLogger({ level: 'info' });
      const contextLogger = logger.setContext('ChainTest');

      expect(contextLogger).toBe(logger);
      contextLogger.info('Test');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[ChainTest] Test'
      );
    });
  });

  describe('Data Logging', () => {
    it('includes data object in logs', () => {
      const logger = new BrowserLogger({ level: 'info' });
      const data = { user: 'test', action: 'click' };

      logger.info('User action', data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        ' User action',
        data
      );
    });

    it('logs data with context', () => {
      const logger = new BrowserLogger({ level: 'info' });
      logger.setContext('Analytics');
      const data = { event: 'page_view' };

      logger.info('Event tracked', data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Analytics] Event tracked',
        data
      );
    });
  });

  describe('LocalStorage', () => {
    it('stores logs in localStorage when enabled', () => {
      const logger = new BrowserLogger({
        level: 'info',
        enableLocalStorage: true,
      });

      logger.info('Test log');

      const stored = BrowserLogger.getStoredLogs();
      expect(stored).toHaveLength(1);
      expect(stored[0].message).toBe('Test log');
      expect(stored[0].level).toBe('info');
    });

    it('respects maxStoredLogs limit', () => {
      const logger = new BrowserLogger({
        level: 'info',
        enableLocalStorage: true,
        maxStoredLogs: 3,
      });

      logger.info('Log 1');
      logger.info('Log 2');
      logger.info('Log 3');
      logger.info('Log 4');

      const stored = BrowserLogger.getStoredLogs();
      expect(stored).toHaveLength(3);
      expect(stored[0].message).toBe('Log 2');
      expect(stored[2].message).toBe('Log 4');
    });

    it('does not store logs when disabled', () => {
      const logger = new BrowserLogger({
        level: 'info',
        enableLocalStorage: false,
      });

      logger.info('Should not store');

      const stored = BrowserLogger.getStoredLogs();
      expect(stored).toHaveLength(0);
    });

    it('clears stored logs', () => {
      const logger = new BrowserLogger({
        level: 'info',
        enableLocalStorage: true,
      });

      logger.info('Test');
      expect(BrowserLogger.getStoredLogs()).toHaveLength(1);

      BrowserLogger.clearStoredLogs();
      expect(BrowserLogger.getStoredLogs()).toHaveLength(0);
    });
  });

  describe('Console Disable', () => {
    it('does not log to console when disabled', () => {
      const logger = new BrowserLogger({
        level: 'info',
        enableConsole: false,
      });

      logger.info('Should not appear');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty messages', () => {
      const logger = new BrowserLogger({ level: 'info' });
      logger.info('');

      expect(consoleInfoSpy).toHaveBeenCalledWith(' ');
    });

    it('handles undefined data', () => {
      const logger = new BrowserLogger({ level: 'info' });
      logger.info('Test', undefined);

      expect(consoleInfoSpy).toHaveBeenCalledWith(' Test');
    });

    it('handles complex data objects', () => {
      const logger = new BrowserLogger({ level: 'info' });
      const complexData = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
        fn: () => 'test',
      };

      logger.info('Complex', complexData);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        ' Complex',
        complexData
      );
    });
  });
});

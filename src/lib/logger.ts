// Logger utility for controlled console output
// Set NEXT_PUBLIC_LOG_LEVEL in your .env.local file to control logging:
// - 'debug': Show all logs (development)
// - 'info': Show info, warn, and error logs
// - 'warn': Show only warn and error logs  
// - 'error': Show only error logs
// - 'none': Disable all console logs (production)

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const getLogLevel = (): LogLevel => {
  if (typeof window === 'undefined') {
    // Server-side: default to info
    return 'info';
  }
  
  const level = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel;
  if (level && ['debug', 'info', 'warn', 'error', 'none'].includes(level)) {
    return level;
  }
  
  // Default based on environment
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
};

const shouldLog = (level: LogLevel): boolean => {
  const currentLevel = getLogLevel();
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'none'];
  const currentIndex = levels.indexOf(currentLevel);
  const messageIndex = levels.indexOf(level);
  
  return messageIndex >= currentIndex;
};

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  
  // Special method for auth state changes
  auth: (event: string, userId?: string) => {
    if (shouldLog('info')) {
      if (userId) {
        console.log(`[AUTH] ${event} - User: ${userId.substring(0, 8)}...`);
      } else {
        console.log(`[AUTH] ${event}`);
      }
    }
  }
}; 
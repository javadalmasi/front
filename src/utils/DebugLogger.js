/**
 * Debug Logger Utility
 * Provides conditional logging based on the VITE_DEBUG_MODE environment variable
 */

// Check if debug mode is enabled
const isDebugMode = () => {
  // Use import.meta.env for Vite environment variables
  if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    return import.meta.env.VITE_DEBUG_MODE === 'true';
  }
  // Fallback for other environments
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    return process.env.VITE_DEBUG_MODE === 'true';
  }
  return false;
};

/**
 * Conditional logging function that only logs when debug mode is enabled
 * @param {string} level - The log level ('log', 'warn', 'error', 'info', 'debug')
 * @param {...any} args - Arguments to log
 */
const debugLog = (level, ...args) => {
  if (isDebugMode()) {
    console[level](...args);
  }
};

/**
 * Specific logging functions for different levels
 */
export const debugLogger = {
  log: (...args) => debugLog('log', ...args),
  warn: (...args) => debugLog('warn', ...args),
  error: (...args) => debugLog('error', ...args),
  info: (...args) => debugLog('info', ...args),
  debug: (...args) => debugLog('debug', ...args),
  
  // Check if debug mode is active
  isEnabled: isDebugMode
};
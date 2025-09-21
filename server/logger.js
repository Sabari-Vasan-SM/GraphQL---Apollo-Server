const fs = require('fs').promises;
const path = require('path');

class Logger {
  constructor() {
    this.logPath = './logs';
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logPath, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      meta
    }) + '\n';
  }

  async writeLog(level, message, meta = {}) {
    try {
      const logFile = path.join(this.logPath, `${new Date().toISOString().split('T')[0]}.log`);
      const logMessage = this.formatMessage(level, message, meta);
      await fs.appendFile(logFile, logMessage);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  info(message, meta = {}) {
    console.log(`[INFO] ${this.getTimestamp()}: ${message}`);
    this.writeLog('INFO', message, meta);
  }

  warn(message, meta = {}) {
    console.warn(`[WARN] ${this.getTimestamp()}: ${message}`);
    this.writeLog('WARN', message, meta);
  }

  error(message, meta = {}) {
    console.error(`[ERROR] ${this.getTimestamp()}: ${message}`);
    this.writeLog('ERROR', message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${this.getTimestamp()}: ${message}`);
      this.writeLog('DEBUG', message, meta);
    }
  }
}

// Custom Error Classes
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Error handling middleware
const errorHandler = (error, logger) => {
  logger.error(error.message, { 
    name: error.name, 
    stack: error.stack,
    field: error.field 
  });

  // Return appropriate GraphQL error
  switch (error.constructor) {
    case ValidationError:
      return new Error(`Validation Error: ${error.message}`);
    case NotFoundError:
      return new Error(`Not Found: ${error.message}`);
    case DatabaseError:
      return new Error(`Database Error: ${error.message}`);
    default:
      return new Error('An unexpected error occurred');
  }
};

module.exports = {
  Logger,
  ValidationError,
  NotFoundError,
  DatabaseError,
  errorHandler
};
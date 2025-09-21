// Environment configuration
const config = {
  server: {
    port: process.env.PORT || 4000,
    cors: {
      origins: process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',')
        : ["http://localhost:5173", "http://localhost:5174"],
      credentials: true
    }
  },
  database: {
    filePath: process.env.DB_FILE_PATH || './data/students.json',
    backupPath: process.env.DB_BACKUP_PATH || './data/backup/'
  },
  validation: {
    maxNameLength: 100,
    minAge: 1,
    maxAge: 120,
    maxCourseLength: 200
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  }
};

// Application constants
const ERRORS = {
  STUDENT_NOT_FOUND: 'Student not found',
  INVALID_INPUT: 'Invalid input provided',
  DUPLICATE_STUDENT: 'Student already exists',
  DATABASE_ERROR: 'Database operation failed',
  VALIDATION_ERROR: 'Validation failed'
};

const SUCCESS_MESSAGES = {
  STUDENT_CREATED: 'Student created successfully',
  STUDENT_UPDATED: 'Student updated successfully',
  STUDENT_DELETED: 'Student deleted successfully'
};

module.exports = {
  config,
  ERRORS,
  SUCCESS_MESSAGES
};
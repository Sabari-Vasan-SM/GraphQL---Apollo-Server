const { ApolloServer, gql } = require("apollo-server");
const DataManager = require('./dataManager');
const { Logger, ValidationError, NotFoundError, errorHandler } = require('./logger');
const { config, ERRORS, SUCCESS_MESSAGES } = require('./config');

// Initialize services
const dataManager = new DataManager();
const logger = new Logger();

// Enhanced GraphQL Schema
const typeDefs = gql`
  type Student {
    id: ID!
    name: String!
    age: Int!
    course: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    students(limit: Int, offset: Int, search: String, course: String): [Student]!
    student(id: ID!): Student
    studentCount: Int!
    courses: [String]!
    healthCheck: String!
  }

  type Mutation {
    addStudent(name: String!, age: Int!, course: String!): Student
    deleteStudent(id: ID!): Boolean
    updateStudent(id: ID!, name: String, age: Int, course: String): Student
    bulkAddStudents(students: [StudentInput!]!): [Student]!
    bulkDeleteStudents(ids: [ID!]!): Boolean
  }

  input StudentInput {
    name: String!
    age: Int!
    course: String!
  }
`;

// Validation functions
function validateStudent(name, age, course) {
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.length > config.validation.maxNameLength) {
    errors.push(`Name must be less than ${config.validation.maxNameLength} characters`);
  }

  if (!age || age < config.validation.minAge || age > config.validation.maxAge) {
    errors.push(`Age must be between ${config.validation.minAge} and ${config.validation.maxAge}`);
  }

  if (!course || course.trim().length === 0) {
    errors.push('Course is required');
  } else if (course.length > config.validation.maxCourseLength) {
    errors.push(`Course must be less than ${config.validation.maxCourseLength} characters`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
}

// Enhanced Resolvers
const resolvers = {
  Query: {
    students: async (_, { limit = 10, offset = 0, search, course }) => {
      try {
        let students = await dataManager.loadStudents();
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          students = students.filter(s => 
            s.name.toLowerCase().includes(searchLower) ||
            s.course.toLowerCase().includes(searchLower)
          );
        }

        // Apply course filter
        if (course) {
          students = students.filter(s => s.course === course);
        }

        // Apply pagination
        const paginatedStudents = students.slice(offset, offset + limit);
        
        logger.info(`Retrieved ${paginatedStudents.length} students`, {
          total: students.length,
          search,
          course,
          limit,
          offset
        });

        return paginatedStudents;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    student: async (_, { id }) => {
      try {
        const students = await dataManager.loadStudents();
        const student = students.find(s => s.id === id);
        
        if (!student) {
          throw new NotFoundError(ERRORS.STUDENT_NOT_FOUND);
        }

        logger.info(`Retrieved student ${id}`, { studentName: student.name });
        return student;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    studentCount: async () => {
      try {
        const students = await dataManager.loadStudents();
        return students.length;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    courses: async () => {
      try {
        const students = await dataManager.loadStudents();
        const uniqueCourses = [...new Set(students.map(s => s.course))];
        return uniqueCourses.sort();
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    healthCheck: () => {
      logger.info('Health check requested');
      return `Server is healthy - ${new Date().toISOString()}`;
    }
  },
  Mutation: {
    addStudent: async (_, { name, age, course }) => {
      try {
        validateStudent(name, age, course);
        
        const student = await dataManager.addStudent({
          name: name.trim(),
          age,
          course: course.trim()
        });

        logger.info(`Student added: ${student.name}`, { studentId: student.id });
        return student;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    updateStudent: async (_, { id, name, age, course }) => {
      try {
        const updates = {};
        if (name !== undefined) {
          if (name.trim().length === 0) throw new ValidationError('Name cannot be empty');
          updates.name = name.trim();
        }
        if (age !== undefined) {
          if (age < config.validation.minAge || age > config.validation.maxAge) {
            throw new ValidationError(`Age must be between ${config.validation.minAge} and ${config.validation.maxAge}`);
          }
          updates.age = age;
        }
        if (course !== undefined) {
          if (course.trim().length === 0) throw new ValidationError('Course cannot be empty');
          updates.course = course.trim();
        }

        const student = await dataManager.updateStudent(id, updates);
        logger.info(`Student updated: ${student.name}`, { studentId: id });
        return student;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    deleteStudent: async (_, { id }) => {
      try {
        await dataManager.deleteStudent(id);
        logger.info(`Student deleted`, { studentId: id });
        return true;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    bulkAddStudents: async (_, { students }) => {
      try {
        const addedStudents = [];
        
        for (const studentData of students) {
          validateStudent(studentData.name, studentData.age, studentData.course);
          const student = await dataManager.addStudent({
            name: studentData.name.trim(),
            age: studentData.age,
            course: studentData.course.trim()
          });
          addedStudents.push(student);
        }

        logger.info(`Bulk added ${addedStudents.length} students`);
        return addedStudents;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    },

    bulkDeleteStudents: async (_, { ids }) => {
      try {
        for (const id of ids) {
          await dataManager.deleteStudent(id);
        }
        
        logger.info(`Bulk deleted ${ids.length} students`, { studentIds: ids });
        return true;
      } catch (error) {
        throw errorHandler(error, logger);
      }
    }
  },
};

// Create Apollo Server with enhanced configuration
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cors: {
    origin: config.server.cors.origins,
    credentials: config.server.cors.credentials,
  },
  plugins: [
    {
      requestDidStart() {
        return {
          didResolveOperation(requestContext) {
            logger.debug(`Operation: ${requestContext.request.operationName}`, {
              query: requestContext.request.query
            });
          },
          didEncounterErrors(requestContext) {
            logger.error('GraphQL errors encountered', {
              errors: requestContext.errors.map(err => ({
                message: err.message,
                path: err.path
              }))
            });
          }
        };
      }
    }
  ],
  formatError: (error) => {
    logger.error('GraphQL Error', { 
      message: error.message,
      path: error.path,
      stack: error.stack 
    });
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_ERROR',
      path: error.path
    };
  }
});

// Start server with enhanced logging
server.listen({ port: config.server.port }).then(({ url }) => {
  logger.info(`🚀 GraphQL Server ready at ${url}`);
  logger.info(`📊 Health check available at ${url}graphql`);
  logger.info(`🔧 Configuration loaded`, { 
    port: config.server.port,
    corsOrigins: config.server.cors.origins 
  });
});

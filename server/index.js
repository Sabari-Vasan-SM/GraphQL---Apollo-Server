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
    addStudent: (_, { name, age, course }) => {
      const newStudent = { id: String(students.length + 1), name, age, course };
      students.push(newStudent);
      return newStudent;
    },
    deleteStudent: (_, { id }) => {
      const index = students.findIndex(s => s.id === id);
      if (index > -1) {
        students.splice(index, 1);
        return true;
      }
      return false;
    },
    updateStudent: (_, { id, name, age, course }) => {
      const student = students.find(s => s.id === id);
      if (student) {
        if (name !== undefined) student.name = name;
        if (age !== undefined) student.age = age;
        if (course !== undefined) student.course = course;
        return student;
      }
      return null;
    },
  },
};

// Step 4: Create Apollo Server with CORS
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // your frontend
    credentials: true,
  },
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

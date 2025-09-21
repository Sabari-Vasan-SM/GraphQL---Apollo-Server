const { ApolloServer, gql } = require("apollo-server");

// Step 1: Define schema
const typeDefs = gql`
  type Student {
    id: ID!
    name: String!
    age: Int!
    course: String!
  }

  type Query {
    students: [Student]!
    student(id: ID!): Student
  }

  type Mutation {
    addStudent(name: String!, age: Int!, course: String!): Student
    deleteStudent(id: ID!): Boolean
    updateStudent(id: ID!, name: String, age: Int, course: String): Student
  }
`;

// Step 2: Sample data
let students = [
  { id: "1", name: "Vasan", age: 22, course: "Computer Science" },
  { id: "2", name: "Aditi", age: 21, course: "Mathematics" },
];

// Step 3: Resolvers
const resolvers = {
  Query: {
    students: () => students,
    student: (_, { id }) => students.find((s) => s.id === id),
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

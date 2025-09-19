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
  }
`;

// Step 2: Sample data
let students = [
  { id: "1", name: "Vasan", age: 22, course: "Computer Science" },
  { id: "2", name: "Aditi", age: 21, course: "Mathematics" },
];

// Step 3: Resolvers (functions to get/modify data)
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
  },
};

// Step 4: Create and start Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

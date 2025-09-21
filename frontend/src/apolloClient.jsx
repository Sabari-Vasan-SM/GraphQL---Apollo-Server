import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000", // make sure no trailing slash
  cache: new InMemoryCache(),
});

export default client;

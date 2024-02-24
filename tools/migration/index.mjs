import { request, gql, GraphQLClient } from 'graphql-request';
const graphQLClient = new GraphQLClient('https://gateway.raventalk.org/graphql');

const locationQuery = gql`
      query GetLocations {
        locations {
          id
          name
        }
      }
    `;
const results = await graphQLClient.request(locationQuery);
console.log("Location query results: " + JSON.stringify(results));
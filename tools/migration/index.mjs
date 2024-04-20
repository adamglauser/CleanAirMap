import { request, gql, GraphQLClient } from 'graphql-request';
import * as fs from 'node:fs';
import { setTimeout } from "timers/promises"
const graphQLClient = new GraphQLClient('https://gateway.raventalk.org/graphql');

var locationsFilePath = './locations.json';
console.log("Preparing query of locations")
const locationQuery = gql`
      query GetLocations {
        locations {
          id
          name
          address
          latitude
          longitude
        }
      }
    `;
const v1Locations = await graphQLClient.request(locationQuery);
console.log("Retrieved %d locations", v1Locations.locations.length);

console.log("Writing to file %s", locationsFilePath);
fs.writeFileSync(locationsFilePath, JSON.stringify(v1Locations));
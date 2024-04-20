import { request, gql, GraphQLClient } from 'graphql-request';
import * as fs from 'node:fs';
import fetch from 'node-fetch';
import { setTimeout } from "timers/promises"
const graphQLClient = new GraphQLClient('https://gateway.raventalk.org/graphql');
var locationsFilePath = './locations.json';

// console.log("Preparing query of locations")
// const locationQuery = gql`
//       query GetLocations {
//         locations {
//           id
//           name
//           address
//           latitude
//           longitude
//         }
//       }
//     `;
// const v1Locations = await graphQLClient.request(locationQuery);
// console.log("Retrieved %d locations", v1Locations.locations.length);

// console.log("Writing to file %s", locationsFilePath);
// fs.writeFileSync(locationsFilePath, JSON.stringify(v1Locations));

var v1Locations = JSON.parse(fs.readFileSync(locationsFilePath));
var aLocation = v1Locations.locations[0];
console.log("Reverse geocode sample location: %s", JSON.stringify(aLocation));
var endpoint="https://api.geoapify.com/v1/geocode/reverse"
var geoapifyKey="keygoeshere";
var geoaplifyQuery = `${endpoint}?lat=${aLocation.latitude}&lon=${aLocation.longitude}&type=amenity&apiKey=${geoapifyKey}&limit=10`
console.log("Will fetch from %s", geoaplifyQuery)

fetch(geoaplifyQuery)
.then(response => response.json())
.then(result => {
  if (result.features.length) {
    console.log(`Found ${result.features.length} features`)
    result.features.forEach(found =>{
      console.log("---")
      console.log(
        `Name: ${found.properties.formatted}
        Addr: ${found.properties.formatted}
        Type: ${found.properties.result_type}
        Cat : ${found.properties.category}`);
    })
  } else {
    console.log("No address found");
  }
});
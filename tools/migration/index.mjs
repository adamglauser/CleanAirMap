import { request, gql, GraphQLClient } from 'graphql-request';
import * as fs from 'node:fs';
import dotenv from 'dotenv'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import ReverseGeocoder from './src/ReverseGeocoder.mjs';

const module_dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({path: `${module_dir}/.env`});
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
var geocoder=new ReverseGeocoder(process.env);

geocoder.search(aLocation.latitude, aLocation.longitude)
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
})
.catch(reason => console.log(`search failed due to ${reason}`));
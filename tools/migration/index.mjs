import dotenv from 'dotenv'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

import ReverseGeocoder from './src/ReverseGeocoder.mjs';
import V1Client from './src/V1Client.mjs'

const module_dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({path: `${module_dir}/.env`});
process.env.APP_ROOT_PATH=module_dir;

//enforce existance of cache dir
const cachePath = `${process.env.APP_ROOT_PATH}\\${process.env.APP_CACHE_DIR}`; 
if (!existsSync(cachePath)) {
  mkdirSync(cachePath);
}

var v1Client = new V1Client(process.env);
var aLocation = (await v1Client.getLocations())[0];
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
import dotenv from 'dotenv'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

import ReverseGeocoder from './src/ReverseGeocoder.mjs';
import AutoCompleter from './src/AutoCompleter.mjs';
import V1Client from './src/V1Client.mjs'
import LocationManager from './src/LocationManager.mjs';

const module_dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({path: `${module_dir}/.env`});
process.env.APP_ROOT_PATH=module_dir;

//enforce existance of cache dir
const cachePath = `${process.env.APP_ROOT_PATH}\\${process.env.APP_CACHE_DIR}`; 
if (!existsSync(cachePath)) {
  mkdirSync(cachePath);
}

var searcher = new AutoCompleter(process.env);
var locMgr = new LocationManager(process.env, new V1Client(process.env), searcher);
await locMgr.loadLocations();
locMgr.loadCachedSearchResults();
console.log("Loaded cached search results");

await locMgr.searchAll();

locMgr.processSearchResults();
locMgr.summarizeMatchResults();

//locMgr.searchAll();

// await locMgr.loadLocations();
// var locationDetail = await locMgr.searchLocationIndex(0);

// var result = locationDetail.searchResult;
//   if (result.features.length) {
//     console.log(`Found ${result.features.length} features`)
//     result.features.forEach(found =>{
//       var rankString = JSON.stringify(found.properties.rank);
//       console.log("---")
//       console.log(
// `    Name: ${found.properties.name}
//     Addr: ${found.properties.formatted}
//     Dist: ${found.properties.distance}
//     Rank: ${rankString}
//     Type: ${found.properties.result_type}
//     Cat : ${found.properties.category}`);
//     })
//   } else {
//     console.log("No address found");
//   }
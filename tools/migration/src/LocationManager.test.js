
const fs = require('fs');
const LocationManager = require('./LocationManager');
const dotenv = require('dotenv');

jest.mock('fs');

test('Can store multiple search results for a location', () => {

    var locations = [
            {
                "id": 2163,
                "name": "Costco",
                "address": "43621 Pacific Commons Boulevard, Fremont, California 94538, United States",
                "latitude": 37.501606,
                "longitude": -121.973145
            },
        ];
    var autoCompleteResult = '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Costco","country":"United States","country_code":"us","state":"California","county":"Alameda County","city":"Fremont","postcode":"94538","street":"Boscell Road","lon":-121.97295708408593,"lat":37.5014494,"state_code":"CA","result_type":"amenity","formatted":"Costco, Boscell Road, Fremont, CA 94538, United States of America","address_line1":"Costco","address_line2":"Boscell Road, Fremont, CA 94538, United States of America","category":"commercial.supermarket","timezone":{"name":"America/Los_Angeles","offset_STD":"-08:00","offset_STD_seconds":-28800,"offset_DST":"-07:00","offset_DST_seconds":-25200,"abbreviation_STD":"PST","abbreviation_DST":"PDT"},"plus_code":"849WG22G+HR","plus_code_short":"G22G+HR, 94538 Fremont, United States","rank":{"importance":0.00000999999999995449,"confidence":1,"match_type":"full_match"},"place_id":"51e123caed447e5ec059a6cc727e2fc04240f00102f90158f5ae0a00000000c00201920306436f7374636f"},"geometry":{"type":"Point","coordinates":[-121.97295708408593,37.5014494]},"bbox":[-121.9739312,37.5007914,-121.9721288,37.5022873]},{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Costco","country":"United States","country_code":"us","state":"California","county":"Alameda County","city":"Newark","postcode":"94538","street":"Newpark Mall","lon":-121.9990692,"lat":37.525842,"state_code":"CA","result_type":"amenity","formatted":"Costco, Newpark Mall, Newark, CA 94538, United States of America","address_line1":"Costco","address_line2":"Newpark Mall, Newark, CA 94538, United States of America","category":"commercial.supermarket","timezone":{"name":"America/Los_Angeles","offset_STD":"-08:00","offset_STD_seconds":-28800,"offset_DST":"-07:00","offset_DST_seconds":-25200,"abbreviation_STD":"PST","abbreviation_DST":"PDT"},"plus_code":"849WG2G2+89","plus_code_short":"G2G2+89, 94538 Newark, United States","rank":{"importance":0.00000999999999995449,"confidence":1,"match_type":"full_match"},"place_id":"51371cf1bff07f5ec0597e6e68ca4ec34240f00103f901117ee5ab02000000c00201920306436f7374636f"},"geometry":{"type":"Point","coordinates":[-121.9990692,37.525842]},"bbox":[-121.9991192,37.525792,-121.9990192,37.525892]},{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Costco Gasoline","country":"United States","country_code":"us","state":"California","county":"Alameda County","city":"Fremont","postcode":"94538","street":"Braun Street","lon":-121.974504,"lat":37.502409,"state_code":"CA","result_type":"amenity","formatted":"Costco Gasoline, Braun Street, Fremont, CA 94538, United States of America","address_line1":"Costco Gasoline","address_line2":"Braun Street, Fremont, CA 94538, United States of America","category":"service.vehicle.fuel","timezone":{"name":"America/Los_Angeles","offset_STD":"-08:00","offset_STD_seconds":-28800,"offset_DST":"-07:00","offset_DST_seconds":-25200,"abbreviation_STD":"PST","abbreviation_DST":"PDT"},"plus_code":"849WG22G+X5","plus_code_short":"G22G+X5, 94538 Fremont, United States","rank":{"importance":0.00000999999999995449,"confidence":1,"match_type":"full_match"},"place_id":"518e7406465e7e5ec059a81b28f04ec04240f00103f901ac5c2b9400000000c0020192030f436f7374636f204761736f6c696e65"},"geometry":{"type":"Point","coordinates":[-121.974504,37.502409]},"bbox":[-121.974554,37.502359,-121.974454,37.502459]},{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Costco Gasoline","country":"United States","country_code":"us","state":"California","county":"Alameda County","city":"Newark","postcode":"94538","street":"Newpark Mall","lon":-121.9979158,"lat":37.5255782,"state_code":"CA","result_type":"amenity","formatted":"Costco Gasoline, Newpark Mall, Newark, CA 94538, United States of America","address_line1":"Costco Gasoline","address_line2":"Newpark Mall, Newark, CA 94538, United States of America","category":"service.vehicle.fuel","timezone":{"name":"America/Los_Angeles","offset_STD":"-08:00","offset_STD_seconds":-28800,"offset_DST":"-07:00","offset_DST_seconds":-25200,"abbreviation_STD":"PST","abbreviation_DST":"PDT"},"plus_code":"849WG2G2+6R","plus_code_short":"G2G2+6R, 94538 Newark, United States","rank":{"importance":0.00000999999999995449,"confidence":1,"match_type":"full_match"},"place_id":"51594a3bdadd7f5ec059ca3e7e2546c34240f00103f901107ee5ab02000000c0020192030f436f7374636f204761736f6c696e65"},"geometry":{"type":"Point","coordinates":[-121.9979158,37.5255782]},"bbox":[-121.9979658,37.5255282,-121.9978658,37.5256282]}],"query":{"text":"Costco"}}';
    var reverseResult = '{"type":"FeatureCollection","features":[{}],"query":{"text":"Costco"}}';
    fs.existsSync.mockReturnValue(true);

    const module_dir = __dirname;
    process.env.APP_ROOT_PATH=module_dir;
    dotenv.config({path: `${module_dir}/.env`});
    
    var cacheKey = ['key1','key2'];
    var locMgr = new LocationManager(process.env, {}, { getCacheKey: () => {return cacheKey[0]} });
    locMgr.setLocation(locations[0]);
    
    fs.readFileSync.mockReturnValue(autoCompleteResult);
    locMgr.loadCachedSearchResults(cacheKey[0]);
    expect(locMgr.totalSearchedLocations[cacheKey[0]]).toEqual(1);
    expect(locMgr.locationDetails[locations[0].id].searchResult[cacheKey[0]]).toEqual(JSON.parse(autoCompleteResult));

    fs.readFileSync.mockReturnValue(reverseResult);
    locMgr.searchClient.getCacheKey = () => {return cacheKey[1]};
    locMgr.loadCachedSearchResults(cacheKey[1]);
    expect(locMgr.totalSearchedLocations[cacheKey[0]]).toEqual(1);
    expect(locMgr.totalSearchedLocations[cacheKey[1]]).toEqual(1);
    expect(Object.keys(locMgr.locationDetails[locations[0].id].searchResult).length).toEqual(2);
    expect(locMgr.locationDetails[locations[0].id].searchResult[cacheKey[0]]).toEqual(JSON.parse(autoCompleteResult));
    expect(locMgr.locationDetails[locations[0].id].searchResult[cacheKey[1]]).toEqual(JSON.parse(reverseResult));
});
import * as fs from 'node:fs';

export default class LocationManager {
    constructor(context, v1Client,reverseGeocoder) {
        this.v1Client = v1Client;
        this.reverseGeocoder = reverseGeocoder;
        this.locationDetails = {};
        this.cacheRoot = `${context.APP_ROOT_PATH}\\${context.APP_CACHE_DIR}`;
    }

    async loadLocations() {
        console.log("LocationManager: Loading locations")
        this.v1Client.getLocations().then(locations => {
            locations.forEach(location => {
                this.setLocation(location)
            })
        })
    }

    setLocation(location) {
        if (this.locationDetails[location.id] === undefined) {
            this.locationDetails[location.id] = {};
        }
        this.locationDetails[location.id].location = location;
    }

    async searchLocationID(id) {
        return await searchLocation(this.locationDetails[id].location)
    }

    async searchLocationIndex(index) {
        var keyAtIndex = Object.keys(this.locationDetails)[index];
        return await this.searchLocation(this.locationDetails[keyAtIndex].location);
    }

    async searchLocation(location) {
        var cachedResult = null;
        if (this.searchCacheExists(location)) {
            console.log(`Loading search results for location ${location.id} from cache`);
            cachedResult = this.getSearchFromCache(location);
        }
        if (cachedResult === null) {
            console.log(`Retrieving search results for location ${location.id} from endpoint`);
            await (this.reverseGeocoder.search(location.latitude, location.longitude, process.env.GEOAPIFY_REVERSE_LIMIT)
                .then(result => {
                    this.writeSearchCache(location, result);
                    cachedResult = result;
                }));
        }
        this.locationDetails[location.id].searchResult = cachedResult;
        return this.locationDetails[location.id];
    }

    getSearchCachePath(location) {
        return `${this.cacheRoot}\\${location.id}_SEARCH_RESULTS`;
    }

    searchCacheExists(location) {
        return fs.existsSync(this.getSearchCachePath(location));
    }

    getSearchFromCache(location) {
        return JSON.parse(fs.readFileSync(this.getSearchCachePath(location)))
    }

    writeSearchCache(location, result) {
        fs.writeFileSync(this.getSearchCachePath(location), JSON.stringify(result));
    }
}
import * as fs from 'node:fs';

export default class LocationManager {
    constructor(context, v1Client,reverseGeocoder) {
        this.v1Client = v1Client;
        this.reverseGeocoder = reverseGeocoder;
        this.locationDetails = {};
        this.cacheRoot = `${context.APP_ROOT_PATH}\\${context.APP_CACHE_DIR}`;
    }

    async enforceLoaded() {
        if (this.locationDetails === undefined || Object.keys(this.locationDetails).length == 0) {
            await this.loadLocations();
        }
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
        await this.enforceLoaded();
        return await this.searchLocation(this.locationDetails[id].location)
    }

    async searchLocationIndex(index) {
        await this.enforceLoaded();
        var keyAtIndex = Object.keys(this.locationDetails)[index];
        return await this.searchLocation(this.locationDetails[keyAtIndex].location);
    }

    async searchLocation(location) {
        await this.enforceLoaded();
        var cachedResult = null;
        if (this.searchCacheExists(location)) {
            console.log(`Loading search results for location ${location.id} from cache`);
            cachedResult = this.getSearchFromCache(location);
        }
        if (cachedResult === null) {
            console.log(`Retrieving search results for location ${location.id} from endpoint`);
            await (this.reverseGeocoder.search(location.latitude, location.longitude, process.env.GEOAPIFY_REVERSE_LIMIT)
                .then(result => {
                    if (result != null) {
                        this.writeSearchCache(location, result);
                        cachedResult = result;
                    }
                })
                .catch(() => cachedResult = null));
        }
        if (cachedResult != null) {
            this.locationDetails[location.id].searchResult = cachedResult;
        }
        return cachedResult != null;
    }

    async searchAll() {
        await this.enforceLoaded();
        var searchedCount = 0;
        var searchCount = this.reverseGeocoder.getRemainingCalls();
        var locationIDs = Object.keys(this.locationDetails);

        var toSearch = locationIDs.filter((id) => this.locationDetails[id].searchResult === undefined);

        console.log(`Starting search of ${searchCount} locations from ID list total size ${locationIDs.length}, unsearched size ${toSearch.length}`)
        toSearch.every((id) => {
            // if search fails, returns false and aborts the loop
            return this.searchLocationID(id);
        });
    }

    loadCachedSearchResults() {
        var locationIDs = Object.keys(this.locationDetails);
        locationIDs.filter((id) => this.searchCacheExists(this.locationDetails[id].location))
            .forEach((id) => {
                var location = this.locationDetails[id].location;
                var cachedResult =this.getSearchFromCache(location)
                location.searchResult = cachedResult;
                //console.log(`Loaded cached search for location ${id}: ${cachedResult.features.length} features`)
            });
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
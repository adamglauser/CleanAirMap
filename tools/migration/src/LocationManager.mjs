import * as fs from 'node:fs';
import MatchProcessor from './MatchProcessor.mjs';

export default class LocationManager {
    constructor(context, v1Client,searcher) {
        this.v1Client = v1Client;
        this.searchClient = searcher;
        this.locationDetails = {};
        this.cacheRoot = `${context.APP_ROOT_PATH}\\${context.APP_CACHE_DIR}`;
        this.totalSearchedLocations = 0;
    }

    getLocationCount() {
        if (this.locationDetails === undefined) { return 0 };

        return Object.keys(this.locationDetails).length;
    }

    getSearchedCount() {
        return this.totalSearchedLocations;
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
        var cacheKey = this.searchClient.getCacheKey();
        if (this.searchCacheExists(location, cacheKey)) {
            console.log(`Loading search results for location ${location.id} from cache`);
            cachedResult = this.getSearchFromCache(location, cacheKey);
        }
        if (cachedResult === null) {
            console.log(`Retrieving search results for location ${location.id} from endpoint`);
            await (this.searchClient.search(location, process.env.GEOAPIFY_REVERSE_LIMIT)
                .then(result => {
                    if (result != null) {
                        this.writeSearchCache(location, cacheKey, result);
                        cachedResult = result;
                    }
                })
                .catch(() => cachedResult = null));
        }
        if (cachedResult != null) {
            this.setSearchResult(location.id, cachedResult);
        }
        return cachedResult != null;
    }

    async searchAll() {
        await this.enforceLoaded();
        var searchedCount = 0;
        var searchCount = this.searchClient.getRemainingCalls();
        var locationIDs = Object.keys(this.locationDetails);

        var toSearch = locationIDs.filter((id) => this.locationDetails[id].searchResult === undefined);

        console.log(`Starting search of ${searchCount} locations from ID list total size ${locationIDs.length}, unsearched size ${toSearch.length}`)
        toSearch.every((id) => {
            // if search fails, returns false and aborts the loop
            return this.searchLocationID(id);
        });
    }

    setSearchResult(id, result) {
        this.locationDetails[id].searchResult = result;
        this.totalSearchedLocations += 1;
    }

    async loadCachedSearchResults() {
        var locationIDs = Object.keys(this.locationDetails);
        var cacheKey = this.searchClient.getCacheKey();
        locationIDs.filter((id) => this.searchCacheExists(this.locationDetails[id].location, cacheKey))
            .forEach((id) => {
                var location = this.locationDetails[id].location;
                var cachedResult =this.getSearchFromCache(location, cacheKey)
                this.setSearchResult(id, cachedResult);
                //console.log(`Loaded cached search for location ${id}: ${cachedResult.features.length} features`)
            });
    }

    processSearchResultID(locationID) {
        var summary = this.processSearchResult(this.locationDetails[locationID].location, this.locationDetails[locationID].searchResult);
        this.locationDetails[locationID].matchSummary = summary;
    }

    processSearchResult(location, searchResults) {
        var matchSummary = MatchProcessor.processReverseResults(location, searchResults);
        return matchSummary;
    }

    processSearchResults() {
        var locationIDs = Object.keys(this.locationDetails);
        locationIDs.filter((id) => this.locationDetails[id].searchResult != undefined)
            .forEach((id) => {
                var location = this.locationDetails[id].location;
                var searchResults = this.locationDetails[id].searchResult;
                this.locationDetails[id].matchSummary = this.processSearchResult(location, searchResults);
            })
    }

    summarizeMatchResults() {
        var locationIDs = Object.keys(this.locationDetails);
        var matched = locationIDs.filter((id) => this.locationDetails[id].matchSummary != undefined);
        var fullNameMatchCount = 0;
        var partNameMatchCount = 0;
        var addrMatchCount = 0;
        var bothCount = 0
        var multipleMatch = 0;
        var noMatchFound = 0;
        console.log("summarizing %d locations", matched.length);
        matched.forEach((id => {
            var summary = this.locationDetails[id].matchSummary;
            var hasNameMatch = summary.nameMatch.count > 0;
            var hasPartMatch = summary.partNameMatch.count > 0;
            var hasAddrMatch = summary.addrMatch.count > 0;
            fullNameMatchCount += hasNameMatch ? 1 : 0;
            partNameMatchCount += hasPartMatch ? 1 : 0;
            addrMatchCount += hasAddrMatch > 0 ? 1 : 0;
            bothCount += (hasNameMatch || hasPartMatch > 0) && hasAddrMatch > 0 ? 1 : 0;
            multipleMatch += (summary.nameMatch.count > 1 || summary.partNameMatch >1 || summary.addrMatch.count > 1) ? 1: 0;
            noMatchFound += (!hasNameMatch && !hasPartMatch && !hasAddrMatch);
        }));

        console.log("Full name matches: %d", fullNameMatchCount);
        console.log("Part name matches: %d", partNameMatchCount);
        console.log("  Address matches: %d", addrMatchCount);
        console.log(" Both match types: %d", bothCount);
        console.log(" Multiple matches: %d", multipleMatch);
        console.log("   No match found: %d", noMatchFound);
    }

    getSearchCachePath(location, cacheKey) {
        return `${this.cacheRoot}\\${cacheKey}\\${location.id}_SEARCH_RESULTS`;
    }

    searchCacheExists(location, cacheKey) {
        return fs.existsSync(this.getSearchCachePath(location, cacheKey));
    }

    getSearchFromCache(location, cacheKey) {
        return JSON.parse(fs.readFileSync(this.getSearchCachePath(location, cacheKey)))
    }

    writeSearchCache(location, cacheKey, result) {
        fs.writeFileSync(this.getSearchCachePath(location, cacheKey), JSON.stringify(result));
    }

    getDetail(id) {
        return this.locationDetails[id];
    }

    showSummary(locationDetail) {
        var location = locationDetail.location;
        console.log("Location: %s, %d:%d, %s\n          %s\n", location.id, location.latitude, location.longitude, location.name);
        console.log("-----");
        console.log("Potential match count: %d", locationDetail.searchResult.features.length);
        console.log("-----");
        var matchSummary = locationDetail.matchSummary;
        console.log("Match summary:\n    Name match: %d\n    Part. name: %d\n    Addr match: %d", matchSummary.nameMatch.count, matchSummary.partNameMatch.count, matchSummary.addrMatch.count);
    }
}
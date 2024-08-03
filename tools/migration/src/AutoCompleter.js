const fetch = require('node-fetch-commonjs');

class AutoCompleter {
    constructor(context) {
        this.endpoint = context.GEOAPIFY_AUTOCOMPLETE_ENDPOINT;
        this.geoapifyKey = context.GEOAPIFY_API_KEY;
        this.callLimit = parseInt(context.GEOAPIFY_CALL_LIMIT);
        this.searchRadius=context.GEOAPIFY_AUTOCOMPLETE_FILTER_RADIUS;
        this.callCount = 0;
        this.cacheKey = 'autocomplete';
    }

    buildQuery(locationName, lat, lon, limit) {
        return `${this.endpoint}?text=${locationName}&filter=circle:${lon},${lat},${this.searchRadius}&type=amenity&apiKey=${this.geoapifyKey}&limit=${limit}`;
    }

    search(location, limit = 10) {
        var query = this.buildQuery(location.name, location.latitude, location.longitude, limit);

        if (this.callCount < this.callLimit) {
            this.callCount += 1;
            return fetch(query).then(response => response.json()).catch(response => Promise.reject(() => null));
        }
        else {
            console.log("Search aborted: geoapify call limit reached")
            return Promise.reject(() => null);
        }
        return Promise.reject(() => null);
    }

    callLimitReached() {
        return this.callCount == this.callLimit;
    }

    getRemainingCalls() {
        return this.callLimit - this.callCount;
    }

    getCacheKey() {
        return this.cacheKey;
    }
}

module.exports = AutoCompleter;


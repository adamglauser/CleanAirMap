import fetch from 'node-fetch';

export default class ReverseGeocoder {
    constructor(context) {
        this.endpoint = context.GEOAPIFY_REVERSE_ENDPOINT;
        this.geoapifyKey = context.GEOAPIFY_API_KEY;
        this.callLimit = parseInt(context.GEOAPIFY_CALL_LIMIT);
        this.callCount = 0;
        this.cacheKey = 'reverse'
    }

    buildQuery(lat, lon, limit) {
        return `${this.endpoint}?lat=${lat}&lon=${lon}&type=amenity&apiKey=${this.geoapifyKey}&limit=${limit}`;
    }

    search(location, limit = 10) {
        var query = this.buildQuery(location.latitude, location.longitude, limit);

        if (this.callCount < this.callLimit) {
            this.callCount += 1;
            return fetch(query).then(response => response.json()).catch(response => new Promise.reject(() => null));
        }
        else {
            console.log("Search aborted: geoapify call limit reached")
        }
        return null;
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


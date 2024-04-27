import fetch from 'node-fetch';

export default class ReverseGeocoder {
    constructor(context) {
        this.endpoint = context.GEOAPIFY_REVERSE_ENDPOINT;
        this.geoapifyKey = context.GEOAPIFY_API_KEY;
        this.callLimit = context.GEOAPIFY_CALL_LIMIT;
        this.callCount = 0;
    }

    buildQuery(lat, lon, limit) {
        return `${this.endpoint}?lat=${lat}&lon=${lon}&type=amenity&apiKey=${this.geoapifyKey}&limit=${limit}`;
    }

    search(lat, lon, limit = 10) {
        var query = this.buildQuery(lat, lon, limit);

        if (this.callCount < this.callLimit) {
            this.callLimit += 1;
            return fetch(query).then(response => response.json());
        }
        return null;
    }
}


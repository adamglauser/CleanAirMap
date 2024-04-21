import fetch from 'node-fetch';

export default class ReverseGeocoder {
    constructor(context) {
        this.endpoint = context.GEOAPIFY_REVERSE_ENDPOINT;
        this.geoapifyKey = context.GEOAPIFY_API_KEY;
    }

    buildQuery(lat, lon, limit) {
        return `${this.endpoint}?lat=${lat}&lon=${lon}&type=amenity&apiKey=${this.geoapifyKey}&limit=${limit}`;
    }

    search(lat, lon, limit = 10) {
        var query = this.buildQuery(lat, lon, limit);

        return fetch(query).then(response => response.json());
    }
}


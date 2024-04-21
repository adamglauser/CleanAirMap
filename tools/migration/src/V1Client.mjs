import { request, gql, GraphQLClient } from 'graphql-request';
import * as fs from 'node:fs';

export default class V1Client {
    constructor(context) {
        this.graphQLClient = new GraphQLClient(context.V1_CLIENT_ENDPOINT);
        this.cachePath = `${context.APP_ROOT_PATH}\\${context.APP_CACHE_DIR}\\${context.V1_LOCATIONS_CACHE}`;
    }   

    cacheExists() {
        return fs.existsSync(this.cachePath);
    }

    async queryLocations() {
        console.log("Preparing query of locations")
        const locationQuery = gql`
                query GetLocations {
                    locations {
                    id
                    name
                    address
                    latitude
                    longitude
                    }
                }
                `;
        const v1Locations = await this.graphQLClient.request(locationQuery);
        console.log("Retrieved %d locations from API", v1Locations.locations.length);
        fs.writeFileSync(this.cachePath, JSON.stringify(v1Locations));
        return v1Locations;
    }

    async getLocations() {
        var v1Locations;
        if (this.cacheExists()) {
            v1Locations = JSON.parse(fs.readFileSync(this.cachePath));
            console.log("Retrieved %d locations from cache", v1Locations.locations.length);
        }
        else {
            v1Locations = await this.queryLocations();
        }

        return v1Locations.locations;
    }
}
class LoadLocationsAction {

    constructor(locationManager, nextChoices) {
        this.parameters = {locationManager: locationManager};
        this.nextChoices = nextChoices;
    }
    async execute() {
        await this.parameters.locationManager.loadLocations();
        return this.nextChoices;
    }
}

module.exports = LoadLocationsAction;
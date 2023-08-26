import { LocationModel, LocationModelInput, RoomModel, ReadingModel } from "./dataTypes";
export interface ILocation {
    getById(id: number) : Promise<LocationModel | null>;
    getMany(maxResults? : number) : Promise<LocationModel[]>;
//TODO: fix name (or remove?) parameter name
    create(reading: LocationModelInput) : Promise<LocationModel | null>;
    getRooms(locationId : number) : Promise<RoomModel[] | null>;
    getReadings(locationId : number) : Promise<ReadingModel[] | null>;
}
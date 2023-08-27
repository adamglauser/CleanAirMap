import { LocationModel, RoomModel, UserModel } from "./dataTypes";
export interface ILocation {
    getById(id: number) : Promise<LocationModel | null>;
    getMany(maxResults? : number) : Promise<LocationModel[]>;
//TODO: fix name (or remove?) parameter name
    create(reading: LocationModel) : Promise<LocationModel | null>;
    getRooms(locationId : number) : Promise<RoomModel[] | null>;
    getUser(locationId : number) : Promise<UserModel>;
}
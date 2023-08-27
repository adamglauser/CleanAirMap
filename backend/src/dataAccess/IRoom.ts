import { LocationModel, RoomModel, UserModel } from "./dataTypes";
export interface IRoom {
    getById(id: number) : Promise<RoomModel | null>;
    getMany(maxResults? : number) : Promise<RoomModel[]>;

    create(reading: RoomModel) : Promise<RoomModel | null>;

    getByLocation(location: LocationModel) : Promise<RoomModel[] | null>;

    getUser(roomId : number) : Promise<UserModel | null>;
}
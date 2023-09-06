import { PrismaDataAdaptor } from "./adaptors/prismaAdaptor/adaptor";
import { ILocation, IRoom, IUser } from "./interfaces";

export interface IDataAdaptor {
    locationDAO : ILocation
    roomDAO : IRoom
    userDAO : IUser
}
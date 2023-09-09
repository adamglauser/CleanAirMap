import { PrismaClient } from "@prisma/client";
import { IDataAdaptor, ILocation, IRoom, IUser } from "../../interfaces";
import { LocationDAO } from "./LocationDAO";
import { RoomDAO } from "./RoomDAO";
import { UserDAO } from "./UserDAO";

const prisma = new PrismaClient({
    log: ['warn', 'error'],
  })

export class PrismaDataAdaptor implements IDataAdaptor {
    client : PrismaClient
    locationDAO: ILocation
    roomDAO: IRoom
    userDAO: IUser

    constructor() {
        this.client = prisma
        this.locationDAO = new LocationDAO(this.client)
        this.roomDAO = new RoomDAO(this.client)
        this.userDAO = new UserDAO(this.client)
    }
}
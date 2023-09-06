import { PrismaClient } from "@prisma/client";
import { IUser } from "../../IUser";
import { UserModel } from "../../dataTypes";

export class UserDAO implements IUser {
    client : PrismaClient

    constructor(client : PrismaClient) {
        this.client = client;
    }

    getById(id: number): Promise<UserModel | null> {
        return this.client.user.findUnique({ where: { id: id } })
    }
}
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

    getByExternalId(externalId: string): Promise<UserModel | null> {
        return this.client.user.findFirst({ where: { externalAuthId: externalId } })
    }

    create(user: UserModel): Promise<UserModel> {
        return this.client.user.create({ data: user });
    }
}
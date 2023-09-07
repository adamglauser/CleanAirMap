import { UserModel } from "./dataTypes"
export interface IUser {
    getById(id: number) : Promise<UserModel | null>;
    getByExternalId(externalId : string) : Promise<UserModel | null>;
    create(user : UserModel) : Promise<UserModel>;
}
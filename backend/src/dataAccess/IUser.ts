import { UserModel } from "./dataTypes"
export interface IUser {
    getById(id: number) : Promise<UserModel | null>;
}
import { UserModel } from "../../dataAccess/dataTypes"

export { UserModel }
export interface IAuthProvider {
    getUser(authHeader : String | undefined) : Promise<UserModel | null>
    getUserId(authHeader : String | undefined) : Promise<number | null>
}
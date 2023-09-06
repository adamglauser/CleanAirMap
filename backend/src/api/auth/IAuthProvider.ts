import { UserModel } from "../../dataAccess/dataTypes"
import { IUser } from "../../dataAccess/interfaces"

export { UserModel }
export interface IAuthProvider {
    getUser(token : String | undefined) : Promise<UserModel | null>
    getUserId(token : String | undefined) : Promise<number | null>
}
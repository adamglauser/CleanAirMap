import { UserModel } from "../../dataAccess/dataTypes"
export { UserModel } from "../../dataAccess/dataTypes"
export interface IAuthProvider {
    getUser(token : String | undefined) : UserModel | null
    getUserId(token : String | undefined) : number | null
}
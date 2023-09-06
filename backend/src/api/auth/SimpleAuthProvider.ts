import { IAuthProvider, UserModel } from "./IAuthProvider";
import { IUser } from "../../dataAccess/interfaces";

export  { IAuthProvider, UserModel} from "./IAuthProvider";

export class SimpleAuthProvider implements IAuthProvider {
    alwaysPass : boolean
    userDAO : IUser

    constructor(env : NodeJS.ProcessEnv, userDAO : IUser) {
        const authMode = env.SIMPLE_AUTH_MODE
        if (authMode != undefined) {
            if (authMode.toLowerCase() === 'pass') {
                this.alwaysPass = true
            }
            else if (authMode.toLowerCase() === 'fail') {
                this.alwaysPass = false
            }
            else {
                throw Error(`Invalid value ${authMode} for SIMPLE_AUTH_MODE. The setting should be "pass" or "fail"`)
            }
        }
        else {
            this.alwaysPass = true;
        }

        this.userDAO = userDAO
    }

    async getUser(token: String | undefined): Promise<UserModel | null> {
        const um : UserModel | null = await this.userDAO.getById(0)
        console.log(`SimpleAuthProvider: Found user: ${JSON.stringify(um)}`)
        return this.alwaysPass ? um : null;
    }
    async getUserId(token: String | undefined): Promise<number | null> {
        const user = await this.getUser(token)
        return  user === null ? null : user.id
    }
}
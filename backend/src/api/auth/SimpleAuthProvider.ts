import { IAuthProvider, UserModel } from "./IAuthProvider";

export  { IAuthProvider, UserModel} from "./IAuthProvider";

export class SimpleAuthProvider implements IAuthProvider {
    alwaysPass : boolean

    constructor(env : NodeJS.ProcessEnv) {
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
    }

    getUser(token: String | undefined): UserModel | null {
        const um : UserModel = { id: 1, name: 'DefaultUser', email: 'default@example.com', externalAuthId: '', externalAuthType: 'SimpleAuthProvider' }
        return this.alwaysPass ? um : null;
    }
    getUserId(token: String | undefined): number | null {
        const user = this.getUser(token)
        return  user === null ? null : user.id
    }
}
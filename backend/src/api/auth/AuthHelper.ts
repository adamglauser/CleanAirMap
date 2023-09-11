import { GraphQLError } from "graphql";
import { UserModel } from "./IAuthProvider";

export class AuthHelper {
    userPromise : Promise<UserModel | null>
    user : UserModel | null | undefined;

    constructor (um : Promise<UserModel | null>) {
        this.userPromise = um
        this.userPromise.then((user) => {
            this.user = user })
        this.user = undefined
    }

    enforceUserAuthenticated() : UserModel {
        this.resolveUser()
        if (this.user === undefined || this.user === null) {
            throw new GraphQLError('You must be logged in to access the API', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: { status: 401 }
                }
            })
        }
        return this.user
    }

    async getAuthenticatedUser() : Promise<UserModel> {
        await this.resolveUser()
        return this.enforceUserAuthenticated()
    }

    async resolveUser() {
        if (!this.user) { this.user = await this.userPromise }
    }
}
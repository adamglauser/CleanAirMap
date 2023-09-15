import * as firebaseAdmin from "firebase-admin"
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier"
import { IAuthProvider, UserModel } from "./IAuthProvider"
import { IUser } from "../../dataAccess/IUser"
import { UserRecord } from "firebase-admin/lib/auth/user-record"
import { GraphQLError } from "graphql"
import { Auth } from "firebase-admin/lib/auth/auth"

async function initFirebase(env : NodeJS.ProcessEnv) : Promise<firebaseAdmin.app.App> {
    const creds = await import(process.env.FIREBASE_CREDS_PATH ?? './firebase_creds.json')
    const app = firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(creds)})
    return app
}

export class FirebaseAuthProvider implements IAuthProvider {
    userDAO : IUser
    auth : Auth | undefined
    adminApp : Promise<firebaseAdmin.app.App>

    constructor(env : NodeJS.ProcessEnv, userDAO : IUser) {
        this.adminApp = initFirebase(env)
        this.adminApp.then((app) => this.auth = app.auth())
        this.auth = undefined
        this.userDAO = userDAO
    }

    async getAuth() {
        if (!this.auth) {
            this.auth = (await this.adminApp).auth()
        }
        return this.auth
    }

    async getUser(authHeader : String | undefined) : Promise<UserModel | null> {
        if (!authHeader) { return null }

        const jwt = authHeader.split(" ")[1]

        return this.getAuth()
            .then((auth) => auth.verifyIdToken(jwt))
            .then(async (decodedIdToken) => {
                const user = this.userDAO.getByExternalId(decodedIdToken.uid)
                if (user == null) {
                    const firebaseUser = await this.auth?.getUser(decodedIdToken.uid)
                    //@ts-ignore - ID is not required on create
                    return this.userDAO.create( {
                        name: firebaseUser?.displayName ?? "Unknown",
                        email: firebaseUser?.email ?? "unknown@example.com",
                        externalAuthId: decodedIdToken?.uid ?? null,
                        externalAuthType: "FirebaseAuthProvider"
                    })
                }
                else {
                    return user
                }
            })
    }
    async getUserId(authHeader : String | undefined) : Promise<number | null> {
        const user = await this.getUser(authHeader)
        return (user) != null ? user.id : null
    }
}
import * as firebaseAdmin from "firebase-admin"
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier"
import { IAuthProvider, UserModel } from "./IAuthProvider"
import { IUser } from "../../dataAccess/IUser"
import { UserRecord } from "firebase-admin/lib/auth/user-record"
import { GraphQLError } from "graphql"

async function initFirebase(env : NodeJS.ProcessEnv) : Promise<firebaseAdmin.app.App> {
    const creds = await import(process.env.FIREBASE_CREDS_PATH ?? './firebase_creds.json')
    const app = firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(creds)})
    return app
}

export class FirebaseAuthProvider implements IAuthProvider {
    adminApp : Promise<firebaseAdmin.app.App>
    userDAO : IUser

    constructor(env : NodeJS.ProcessEnv, userDAO : IUser) {
        this.adminApp = initFirebase(env)
        this.userDAO = userDAO
    }
    async getUser(authHeader : String | undefined) : Promise<UserModel | null> {
        if (!authHeader) { return null }

        const jwt = authHeader.split(" ")[1]
        if (!jwt) {
            throw new GraphQLError("Invalid Authorization header: should be 'Bearer: <your token>'")
        }

        let decodedToken : DecodedIdToken | null = null
        let firebaseUser : UserRecord | null = null
        try {
            const authService = (await this.adminApp).auth()
            decodedToken = await authService.verifyIdToken(jwt)
            firebaseUser = await authService.getUser(decodedToken.uid)
        }
        catch (e) {
            console.error(e)
        }
        finally {
            if (decodedToken == null || firebaseUser == null) { return null }
        }

        return this.userDAO.getByExternalId(decodedToken.uid).then((user) => {
            if (user == null) {
                //@ts-ignore - ID is not required on create
                return this.userDAO.create( {
                    name: firebaseUser?.displayName ?? "Unknown",
                    email: firebaseUser?.email ?? "unknown@example.com",
                    externalAuthId: decodedToken?.uid ?? null,
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
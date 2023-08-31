import { IDataAdaptor } from "../dataAccess/interfaces";
import { PrismaDataAdaptor } from "../dataAccess/adaptors/prismaAdaptor/adaptor";
import { makeSchema } from 'nexus'
import { Location, Room } from './graphql'
import { LegacyAdaptor } from "../dataAccess/adaptors/legacyAdaptor/adaptor";
import dotenv from 'dotenv'
import * as firebaseAdmin from "firebase-admin"

dotenv.config()

async function initFirebase() : Promise<firebaseAdmin.app.App> {
    console.log("Initializing firebase app")
    const creds = await import(process.env.FIREBASE_CREDS_PATH ?? './firebase_creds.json')
    const app = firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(creds)})
    return app
}

const adminApp = initFirebase()

export interface Context {
    db: IDataAdaptor,
    photoStorage: firebaseAdmin.storage.Storage
}

export const createContext = async () => ({
    db: new PrismaDataAdaptor(),
    photoStorage: (await adminApp).storage()
})

export const createLegacyContext = async () => ({
    db: new LegacyAdaptor(process.env.USE_LEGACY_ENDPOINT || ""),
    photoStorage: (await adminApp).storage()
});


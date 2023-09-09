import { IDataAdaptor } from "../dataAccess/interfaces";
import { PrismaDataAdaptor } from "../dataAccess/adaptors/prismaAdaptor/adaptor";
import { makeSchema } from 'nexus'
import { Location, Room } from './graphql'
import { LegacyAdaptor } from "../dataAccess/adaptors/legacyAdaptor/adaptor";
import { SimpleAuthProvider } from "./auth/SimpleAuthProvider";
import { IncomingMessage, OutgoingMessage } from "http";
import { GraphQLError } from "graphql";
import dotenv from 'dotenv'
import { FirebaseAuthProvider } from "./auth/FirebaseAuthProvider";

dotenv.config()
const adaptor = process.env.USE_LEGACY_ENDPOINT
    ? new LegacyAdaptor(process.env.USE_LEGACY_ENDPOINT || "")
    : new PrismaDataAdaptor()

export interface Context {
    db: IDataAdaptor,
    uid: number | null
}

const auth = new FirebaseAuthProvider(process.env, adaptor.userDAO);

const getAuthorizedUserID = async (req: IncomingMessage): Promise<number> => {
    const user = await auth.getUserId(req.headers.authorization)
    if (user === undefined || user == null) {
        //TODO: figure out how to make this actually return to client instead of
        //  logging error to console and client request times out
        throw new GraphQLError('You must be logged in to access the API', {
            extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 }
            }
        })
    }
    return user
}

export const createContext = async ({ req, res }: { req: IncomingMessage, res: OutgoingMessage }) => {
    const timerName = `create_context${Date.now()}`
    console.time(timerName)
    try {
        const context = {
            db: adaptor,
            uid: await getAuthorizedUserID(req)
        }
        return context
    }
    finally {
        console.timeEnd(timerName)
    }
}


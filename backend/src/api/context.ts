import { IDataAdaptor } from "../dataAccess/interfaces";
import { PrismaDataAdaptor } from "../dataAccess/adaptors/prismaAdaptor/adaptor";
import { makeSchema } from 'nexus'
import { Location, Room } from './graphql'
import { LegacyAdaptor } from "../dataAccess/adaptors/legacyAdaptor/adaptor";
import { SimpleAuthProvider } from "./auth/SimpleAuthProvider";
import { IncomingMessage, OutgoingMessage } from "http";
import { GraphQLError } from "graphql";
import dotenv from 'dotenv'

dotenv.config()

export interface Context {
    db: IDataAdaptor,
    uid: number | null
}

const auth = new SimpleAuthProvider(process.env);

const getAuthorizedUserID = async (req: IncomingMessage): Promise<number> => {
    const user = auth.getUserId(req.headers.authorization)
    if (!user) {
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

export const createContext = async ({ req, res }: { req: IncomingMessage, res: OutgoingMessage }) => ({
    db: new PrismaDataAdaptor(),
    uid: await getAuthorizedUserID(req)
})

export const createLegacyContext = async ({ req, res }: { req: IncomingMessage, res: OutgoingMessage }) => ({
    db: new LegacyAdaptor(process.env.USE_LEGACY_ENDPOINT || ""),
    uid: await getAuthorizedUserID(req)
});


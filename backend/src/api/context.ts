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
import { BaseContext } from "@apollo/server";

dotenv.config()
const adaptor = process.env.USE_LEGACY_ENDPOINT
    ? new LegacyAdaptor(process.env.USE_LEGACY_ENDPOINT || "")
    : new PrismaDataAdaptor()

export interface Context extends BaseContext {
    db: IDataAdaptor,
    uid: Promise<number | null>
}

const auth = new FirebaseAuthProvider(process.env, adaptor.userDAO);

const getAuthorizedUserID = (req: IncomingMessage): Promise<number | null> => auth.getUserId(req.headers.authorization)

export const createContext = ({ req, res }: { req: IncomingMessage, res: OutgoingMessage }): Context => {
    const timerName = `create_context${Date.now()}`
    console.time(timerName)
    try {
        const context = {
            db: adaptor,
            uid: getAuthorizedUserID(req)
        }
        return context
    }
    finally {
        console.timeEnd(timerName)
    }
}

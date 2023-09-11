import { IDataAdaptor } from "../dataAccess/interfaces";
import { PrismaDataAdaptor } from "../dataAccess/adaptors/prismaAdaptor/adaptor";
import { makeSchema } from 'nexus'
import { Location, Room } from './graphql'
import { LegacyAdaptor } from "../dataAccess/adaptors/legacyAdaptor/adaptor";
import { IAuthProvider, SimpleAuthProvider } from "./auth/SimpleAuthProvider";
import { IncomingMessage, OutgoingMessage } from "http";
import { GraphQLError } from "graphql";
import dotenv from 'dotenv'
import { FirebaseAuthProvider } from "./auth/FirebaseAuthProvider";
import { BaseContext } from "@apollo/server";
import { AuthHelper } from "./auth/AuthHelper";

dotenv.config()
const adaptor = process.env.USE_LEGACY_ENDPOINT
    ? new LegacyAdaptor(process.env.USE_LEGACY_ENDPOINT || "")
    : new PrismaDataAdaptor()

const auth = new FirebaseAuthProvider(process.env, adaptor.userDAO);

export interface Context extends BaseContext {
    db: IDataAdaptor,
    authHelper: AuthHelper
}

export const createContext = ({ req, res }: { req: IncomingMessage, res: OutgoingMessage }): Context => {
    const timerName = `create_context${Date.now()}`
    console.time(timerName)
    try {
        const context = {
            db: adaptor,
            authHelper: new AuthHelper(auth.getUser(req.headers.authorization))
        }
        return context
    }
    finally {
        console.timeEnd(timerName)
    }
}

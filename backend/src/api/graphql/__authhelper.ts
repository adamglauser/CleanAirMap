import { GraphQLError } from "graphql"

export async function requireAuthenticatedUser(ctx) : Promise<number> {
    return ctx.uid.then((userId: number) : number => {
        if (userId === undefined || userId === null) {
            throw new GraphQLError('You must be logged in to access the API', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: { status: 401 }
                }
            })
        }
        return userId
    })
}
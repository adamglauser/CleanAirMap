import { IUser } from '../../interfaces'
import { UserModel } from '../../dataTypes';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

class UserDAO implements IUser {
    client : ApolloClient<NormalizedCacheObject>;

    constructor(client : ApolloClient<NormalizedCacheObject>) {
        this.client = client;
    }

    getById(id: number): Promise<UserModel | null> {
        return Promise.reject(new Error("Not implemented"));
    }
}

export default UserDAO
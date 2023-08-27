import { objectType, extendType } from 'nexus'

export const User = objectType({
    name: 'User',
    sourceType: 'UserModel',
    definition(t) {
        t.int('id'),
        t.string('name'),
        t.string('email')
    },
})
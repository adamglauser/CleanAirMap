import { arg, floatArg, objectType, enumType, inputObjectType } from 'nexus'
import { extendType } from 'nexus'
import { stringArg, nonNull, intArg } from 'nexus'
import { Position } from './GraphQLPosition'

export const LocationEnum = enumType({
    name: "LocationEnum",
    members: {
      ALL: 999,
      SHOP: 0,
      MUSEUM: 1,
      BAR: 2,
      CAFE: 3,
      HOSPITAL: 4,
      TRAIN: 5,
      RESTAURANT: 6,
      LIBRARY: 7,
      ARTS: 8,
      HOTEL: 9,
      GASSTATION: 10,
      PARKING: 11,
      MOVIE: 12,
      PARK: 13,
      CAMERA: 14,
      ARENA: 15,
      PHARMACY: 16,
      SCHOOL: 17,
      BEAUTY: 18,
      FITNESS: 19,
      SENIORS: 20,
      PROFESSIONAL: 21,
      DENTISTS: 22,
      DINING: 23,
      WORSHIP: 24
    },
    description: 'The type of location, eg. shop, place of worship, hospital, etc.'
  })

export const Location = objectType({
    name: 'Location',
    sourceType: 'LocationModel',
    definition(t) {
        t.int('locationId'),
        t.string('name'),
        t.field('type', { type: 'LocationEnum' })
        t.string('street'),
        t.string('locality'),
        t.string('place'),
        t.string('district'),
        t.string('region'),
        t.string('postcode'),
        t.field('position', {
            type: 'Position',
            resolve: (locationModel) => {
                return new Position(locationModel.latitude, locationModel.longitude)
            }
            })
        t.string('description'),
        t.float('avgCo2'),
        t.list.nonNull.field('rooms', {
            type: 'Room',
            resolve: (parent, _, ctx) => {
                return ctx.db.locationDAO.getRooms(parent.locationId);
            }
        })
        t.int('created_id'),
        t.datetime('created_at')
    },
})

export const LocationSummary = objectType({
    name: 'LocationSummary',
    sourceType: 'LocationModel',
    definition(t) {
        t.int('locationId'),
        t.string('name'),
        t.field('type', { type: 'LocationEnum' })
        t.string('street'),
        t.string('locality'),
        t.string('place'),
        t.string('district'),
        t.string('region'),
        t.string('postcode'),
        t.field('position', {
            type: 'Position',
            resolve: (locationModel) => {
                return new Position(locationModel.latitude, locationModel.longitude)
            }
            })
        t.string('description'),
        t.float('avgCo2'),
        t.int('created_id'),
        t.datetime('created_at')
    },
})

export const LocationInputType = inputObjectType({
    name: 'LocationInputType',
    definition(t) {
        t.nonNull.string('name'),
        t.nonNull.field('type', { type: 'LocationEnum' })
        t.nonNull.string('street'),
        t.string('locality'),
        t.nonNull.string('place'),
        t.string('district'),
        t.nonNull.string('region'),
        t.string('postcode'),
        t.nonNull.field('position', { type: 'Position' }),
        t.nonNull.string('country'),
        t.string('description')
    },
})

export const LocationQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('locationDetail', {
            type: 'Location',
            args: { locationId: intArg()},
            async resolve(_root, _args, ctx) {
                if (_args == null || _args.locationId == null) {
                    return ctx.db.locationDAO.getMany();
                }
                if (_args != null && _args.locationId != null) {
                    const single = await ctx.db.locationDAO.getById(_args.locationId);
                    return [ single ] ;
                }
                return null;
            }
        }),
        t.list.field('locationSummary', {
            type: 'LocationSummary',
            args: { locationId: intArg()},
            async resolve(_root, _args, ctx) {
                if (_args == null || _args.locationId == null) {
                    return ctx.db.locationDAO.getMany();
                }
                if (_args != null && _args.locationId != null) {
                    const single = await ctx.db.locationDAO.getById(_args.locationId);
                    return [ single ] ;
                }
                return null;
            }
        })
    },
})

export const LocationMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createLocation', {
            type: 'Location',
            args: { data: nonNull(LocationInputType) },
            async resolve(_root, args, ctx) {
                const location  = {
                    name: args.data.name,
                    street: args.data.street,
                    locality: args.data.locality,
                    place: args.data.place,
                    district: args.data.district,
                    region: args.data.region,
                    postcode: args.data.postcode,
                    country: args.data.country,
                    type: args.data.type,
                    latitude: args.data.position.latitude,
                    longitude: args.data.position.longitude,
                    description: args.data.description,
                    avgCo2: null,
                    created_id: 1
                }
                //@ts-ignore: missing ID is okay, as it will be autogenerated
                //TODO: perhaps create a NewLocation type with no ID
                const newloc = await ctx.db.locationDAO.create( location )
                return newloc
            }
        })
    }
})
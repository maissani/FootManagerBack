import { GraphQLDateTime } from 'graphql-iso-date'

import userResolvers from '../resolvers/user'
import playerResolvers from './player'

const customScalarResolver = {
  Date: GraphQLDateTime
}

export default [
  customScalarResolver,
  userResolvers,
  playerResolvers
]

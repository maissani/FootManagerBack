import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    players(cursor: String, limit: Int): PlayerConnection!
    player(id: ID!): Player!
  }
  extend type Mutation {
    createPlayer(
      name: String!
      description: String!
    ): Player!
    deletePlayer(id: ID!): Boolean!
  }
  type PlayerConnection {
    edges: [Player!]!
    pageInfo: PageInfo!
  }
  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }
  type Player {
    id: ID!
    name: String!
    description: String!
    createdAt: Date!
    user: User!
  }
  extend type Subscription {
    playerCreated: PlayerCreated!
  }
  type PlayerCreated {
    player: Player!
  }
`

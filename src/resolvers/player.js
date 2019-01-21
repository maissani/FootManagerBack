import Sequelize from 'sequelize'
import { combineResolvers } from 'graphql-resolvers'

import pubsub, { EVENTS } from '../subscription'
import { isAuthenticated, isPlayerOwner } from './authorization'

const toCursorHash = string => Buffer.from(string).toString('base64')

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii')

export default {
  Query: {
    players: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
          where: {
            createdAt: {
              [Sequelize.Op.lt]: fromCursorHash(cursor)
            }
          }
        }
        : {}

      const players = await models.Player.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions
      })

      const hasNextPage = players.length > limit
      const edges = hasNextPage ? players.slice(0, -1) : players

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(
            edges[edges.length - 1].createdAt.toString()
          )
        }
      }
    },
    player: async (parent, { id }, { models }) => {
      const foundPlayer = await models.Player.findById(id)
      return foundPlayer
    }
  },

  Mutation: {
    createPlayer: combineResolvers(
      isAuthenticated,
      async (parent, { name, description }, { models, me }) => {
        const player = await models.Player.create({
          name,
          description,
          userId: me.id
        })

        pubsub.publish(EVENTS.PLAYER.CREATED, {
          playerCreated: { player }
        })

        return player
      }
    ),

    deletePlayer: combineResolvers(
      isAuthenticated,
      isPlayerOwner,
      async (parent, { id }, { models }) => {
        const playerDestruction = await models.Player.destroy({ where: { id } })
        return playerDestruction
      }
    )
  },

  Player: {
    user: async (player, args, { loaders }) => {
      const playerUser = await loaders.user.load(player.userId)
      return playerUser
    }
  },

  Subscription: {
    playerCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PRODUCT.CREATED)
    }
  }
}

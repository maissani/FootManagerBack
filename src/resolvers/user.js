import jwt from 'jsonwebtoken'
import { combineResolvers } from 'graphql-resolvers'
import { AuthenticationError, UserInputError } from 'apollo-server'

import { isAdmin } from './authorization'

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user
  const jwtSignature = await jwt.sign({ id, email, username, role }, secret, {
    expiresIn
  })
  return jwtSignature
}

export default {
  Query: {
    users: async (parent, args, { models }) => {
      const userList = await models.User.findAll()
      return userList
    },
    user: async (parent, { id }, { models }) => {
      const userFound = await models.User.findById(id)
      return userFound
    },
    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null
      }
      const myUser = await models.User.findById(me.id)
      return myUser
    }
  },

  Mutation: {
    signUp: async (
      parent,
      { firstname, lastname, username, email, password },
      { models, secret }
    ) => {
      const user = await models.User.create({
        firstname,
        lastname,
        username,
        email,
        password
      })

      return { token: createToken(user, secret, '30m') }
    },

    signIn: async (
      parent,
      { login, password },
      { models, secret }
    ) => {
      const user = await models.User.findByLogin(login)

      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.'
        )
      }

      const isValid = await user.validatePassword(password)

      if (!isValid) {
        throw new AuthenticationError('Invalid password.')
      }

      return { token: createToken(user, secret, '30m') }
    },

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => {
        const userDestruction = await models.User.destroy({
          where: { id }
        })
        return userDestruction
      }
    )
  },

  User: {
    players: async (user, args, { models }) => {
      const userPlayers = await models.Player.findAll({
        where: {
          userId: user.id
        }
      })
      return userPlayers
    }
  }
}

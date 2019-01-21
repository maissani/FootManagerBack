import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import jwt from 'jsonwebtoken'
import DataLoader from 'dataloader'
import express from 'express'
import {
  ApolloServer,
  AuthenticationError
} from 'apollo-server-express'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'
import loaders from './loaders'

const app = express()

app.use(cors())

const getMe = async req => {
  const token = req.headers['x-token']

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET)
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.'
      )
    }
  }
}

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '')

    return {
      ...error,
      message
    }
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models)
          )
        }
      }
    }

    if (req) {
      const me = await getMe(req)

      return {
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models)
          )
        }
      }
    }
  }
})

server.applyMiddleware({ app, path: '/graphql' })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

// const isTest = !!process.env.TEST_DATABASE
// const isProduction = !!process.env.DATABASE_URL
const port = process.env.PORT || 8000

sequelize.sync({ force: true }).then(async () => {
  createUsersWithMessages(new Date())

  httpServer.listen({ port }, () => {
    console.log(`Apollo Server on http://localhost:${port}/graphql`)
  })
})

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      firstname: 'Mehdi',
      lastname: 'Aissani',
      username: 'club',
      email: 'contact@mehdiaissani.com',
      password: 'password+1',
      role: 'ADMIN',
      players: [
        {
          name: 'Mario Götze',
          description: "Auteur du but décisif en finale de la Coupe du monde, contre l'Argentine (1-0), l'attaquant allemand restera pour toujours celui qui a offert son quatrième titre à la Mannschaft. Cette seule raison suffit à le placer très haut dans le classement. Mais il a aussi participé activement au cavalier seul du Bayern en Championnat. Ce qui n'est pas négligeable.",
          createdAt: date.setSeconds(date.getSeconds() + 1)
        },
        {
          name: 'Paul Pogba',
          description: "Maillon fort de la Juventus dans la conquête de son troisième Scudetto consécutif en Serie A, le milieu français a confirmé ses énormes progrès. Doté de qualités rares, l'international tricolore s'est aussi illustré lors du Mondial en allant jusqu'en quarts de finale avec les Bleus. A 21 ans, il a tout l'avenir devant lui.",
          createdAt: date.setSeconds(date.getSeconds() + 1)
        },
        {
          name: 'Javier Mascherano',
          description: "Excellent avec le Barça comme sous le maillot de l'Argentine, Javier Mascherano n'a cependant rien gagné puisqu'il a terminé deuxième de la Liga et finaliste d'un Mondial dont il a été l'un des dix meilleurs selon la FIFA. Le polyvalent joueur défensif de 30 ans (il évolue aussi bien en défense centrale qu'à la récupération) est sûrement l'un des joueurs les plus sous-estimés au monde actuellement.",
          createdAt: date.setSeconds(date.getSeconds() + 1)
        }
      ]
    },
    {
      include: [models.Player]
    }
  )

  await models.User.create(
    {
      firstname: 'José',
      lastname: 'Mourinho',
      username: 'jmourinho',
      email: 'contact@jmourinho.com',
      password: 'password+2',
      players: [
      ]
    },
    {
      include: [models.Player]
    }
  )
}

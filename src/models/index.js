import Sequelize from 'sequelize'

let sequelize

sequelize = new Sequelize('footmanager', null, null, {
  dialect: 'sqlite',
  storage: './footmanager.sqlite'
})

const models = {
  User: sequelize.import('./user'),
  Player: sequelize.import('./player')
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

export { sequelize }

export default models

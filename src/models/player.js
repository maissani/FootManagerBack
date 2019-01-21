const player = (sequelize, DataTypes) => {
  const Player = sequelize.define('player', {
    name: {
      type: DataTypes.STRING,
      validate: { notEmpty: true }
    },
    description: {
      type: DataTypes.STRING,
      validate: { notEmpty: true }
    }
  })

  Player.associate = models => {
    Player.belongsTo(models.User)
  }

  return Player
}

export default player

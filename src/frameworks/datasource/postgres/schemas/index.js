const Sequelize = require('sequelize')

const users = require('./user.schema')

module.exports = {
  users: users(Sequelize)
}

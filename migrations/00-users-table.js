const path = require('path')

const { users: model } = require(path.resolve(
  path.dirname(__dirname),
  'src',
  'frameworks',
  'datasource',
  'postgres',
  'schemas',
  'index.js'
))

async function up({ context: sequelize }) {
  const Model = model.execute(sequelize)
  await Model.sync({ force: false, alter: false })
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('users')
}

module.exports = { up, down }

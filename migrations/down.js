const { Sequelize } = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')
require('dotenv').config()

const opts = {
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST
}

const args = process.argv.slice(2)[0]
const mtbl = typeof args === 'string' ? args : '*'

const connstr = `postgres://${opts.user}:${opts.pass}@${opts.host}:${opts.port}/${opts.name}`

const sequelize = new Sequelize(connstr, {
  logging: false
})

const umzug = new Umzug({
  migrations: { glob: `migrations/${mtbl}-*-table.js` },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize })
  // logger: console
})

  ; (() => {
    umzug.on('reverting', (ev) => console.log('> reverting: %s', ev.name))
    umzug.on('reverted', (ev) => console.log('> reverted: %s', ev.name))
    sequelize
      .authenticate()
      .then(async () => {
        console.log('> database connection successfully established.')
        const migrations = await umzug.executed()
        if (migrations.length) {
          await umzug.down({ to: 0 })
        } else {
          console.log('> migrations queue is empty')
        }
        process.exit()
      })
      .catch((err) => {
        console.error('> unable to connect to the database:', err)
        process.exit()
      })
  })()

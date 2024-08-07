const express = require('express')

const service = require('./service')
const users = require('./users')

module.exports = (dependencies) => {
  const router = express.Router()

  const serviceRouter = service(dependencies)
  const usersRouter = users(dependencies)

  router.use('/', serviceRouter)
  router.use('/users', usersRouter)

  return router
}

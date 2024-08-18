const express = require('express')

const service = require('./service')
module.exports = (dependencies) => {
  const router = express.Router()

  const serviceRouter = service(dependencies)

  router.use('/', serviceRouter)

  return router
}

const express = require('express')

const service = require('./service')
const instagram = require('./instagram')

module.exports = (dependencies) => {
  const router = express.Router()

  const serviceRouter = service(dependencies)
  const instagramRouter = instagram(dependencies)

  router.use('/', serviceRouter)
  router.use('/instagram', instagramRouter)

  return router
}

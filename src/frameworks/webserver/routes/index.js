const express = require('express')

const service = require('./service')
const content = require('./content')
module.exports = (dependencies) => {
  const router = express.Router()

  const serviceRouter = service(dependencies)
  const contentRouter = content(dependencies)

  router.use('/', serviceRouter)
  router.use('/content', contentRouter)

  return router
}

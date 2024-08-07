const express = require('express')

const { instagramControllers } = require('../../../controllers')

module.exports = (dependencies) => {
  const router = express.Router()

  const {
    middlewares: { }
  } = dependencies

  const {
    appController
  } = instagramControllers(dependencies)

  router
    .route('/app')
    .get(
      appController
    )

  return router
}

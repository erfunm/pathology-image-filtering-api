const express = require('express')

const { userControllers } = require('../../../controllers')

module.exports = (dependencies) => {
  const router = express.Router()

  const {
    middlewares: { }
  } = dependencies

  const {
    getUserController
  } = userControllers(dependencies)

  router
    .route('/me')
    .get(
      getUserController
    )

  return router
}

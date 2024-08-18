const express = require('express')

const { serviceControllers } = require('../../../controllers')

module.exports = (dependencies) => {
  const router = express.Router()
  const { rootController, healthController } =
    serviceControllers(dependencies)

  router.route('/').get(rootController)
  router.route('/health').get(healthController)

  return router
}

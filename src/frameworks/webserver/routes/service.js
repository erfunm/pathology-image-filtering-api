const express = require('express')

const { serviceControllers } = require('../../../controllers')

module.exports = (dependencies) => {
  const router = express.Router()
  const { healthController } =
    serviceControllers(dependencies)

  router.route('/health').get(healthController)

  return router
}

const rootController = require('./root.controller')
const healthController = require('./health.controller')

module.exports = (dependencies) => {
  return {
    rootController: rootController(),
    healthController: healthController()
  }
}

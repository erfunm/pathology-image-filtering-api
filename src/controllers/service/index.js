const healthController = require('./health.controller')

module.exports = (dependencies) => {
  return {
    healthController: healthController()
  }
}

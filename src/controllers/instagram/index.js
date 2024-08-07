const appController = require('./app.controller')

module.exports = (dependencies) => {
  return {
    appController: appController(dependencies)
  }
}

const getUserController = require('./getUser.controller')

module.exports = (dependencies) => {
  return {
    getUserController: getUserController(dependencies)
  }
}

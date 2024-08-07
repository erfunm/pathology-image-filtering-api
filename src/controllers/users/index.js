const verifyAzureUserController = require('./verifyAzureUser.controller')
const signoutUserController = require('./signoutUser.controller')
const getUserController = require('./getUser.controller')
const getUsersByRolesController = require('./getUsersByRoles.controller')
const authAzureController = require('./authAzure.controller')

module.exports = (dependencies) => {
  return {
    verifyAzureUserController: verifyAzureUserController(dependencies),
    signoutUserController: signoutUserController(dependencies),
    getUserController: getUserController(dependencies),
    getUsersByRolesController: getUsersByRolesController(dependencies),
    authAzureController: authAzureController(dependencies)
  }
}

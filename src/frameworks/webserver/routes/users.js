const express = require('express')

const { userControllers } = require('../../../controllers')

module.exports = (dependencies) => {
  const router = express.Router()

  const {
    middlewares: {
      authAzureMiddleware,
      fetchUserMiddleware,
      saveActivityMiddleware
    }
  } = dependencies

  const {
    verifyAzureUserController,
    signoutUserController,
    getUserController,
    getUsersByRolesController,
    authAzureController
  } = userControllers(dependencies)

  router.route('/auth').post(verifyAzureUserController)
  router
    .route('/signout')
    .post(authAzureMiddleware(dependencies), signoutUserController)

  router
    .route('/me')
    .get(
      authAzureMiddleware(dependencies),
      fetchUserMiddleware(dependencies),
      saveActivityMiddleware(dependencies),
      getUserController
    )

  router
    .route('/roles/:roles')
    .get(
      authAzureMiddleware(dependencies),
      fetchUserMiddleware(dependencies),
      saveActivityMiddleware(dependencies),
      getUsersByRolesController
    )

  router.route('/signin').all(authAzureController)

  return router
}

const express = require('express')

const { contentControllers } = require('../../../controllers')

module.exports = (dependencies) => {
  const router = express.Router()
  const { listController, profileController, fileController, deleteFileController, exportCSVController } =
    contentControllers(dependencies)

  router.route('/list').get(listController)
  router.route('/profile/:profileId')
    .get(profileController)
  router.route('/profile/:profileId/export-csv')
    .get(exportCSVController)
  router.route('/profile/:profileId/file/:fileName')
    .get(fileController)
    .delete(deleteFileController)

  return router
}

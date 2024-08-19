const listController = require('./list.controller')
const profileController = require('./profile.controller')
const fileController = require('./file.controller')
const deleteFileController = require('./deleteFile.controller')
const exportCSVController = require('./exportCSV.controller')

module.exports = (dependencies) => {
  return {
    listController: listController(dependencies),
    profileController: profileController(dependencies),
    fileController: fileController(dependencies),
    deleteFileController: deleteFileController(dependencies),
    exportCSVController: exportCSVController(dependencies)
  }
}

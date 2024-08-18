const { Response } = require('../../frameworks/common')
const AppPackage = require('../../../package.json')

module.exports = () => {
  return (req, res, next) => {
    try {
      const content = {
        message: `${AppPackage.name} v${AppPackage.version} by ${AppPackage.author}`
      }

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

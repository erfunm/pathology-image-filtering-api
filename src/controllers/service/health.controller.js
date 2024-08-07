const { Response } = require('../../frameworks/common')
const UAParser = require('ua-parser-js')

module.exports = () => {
  return (req, res, next) => {
    try {
      const {
        query: { code }
      } = req
      const content = {
        message: 'Healthy'
      }

      const parser = new UAParser(req.headers['user-agent']) // user-agent
      const { device: { type: deviceType } } = parser.getResult()
      if (deviceType === 'mobile' && !code) {
        content.redirect = '/mobile'
      }

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

const requestLoggerMiddleware = require('./requestLogger.middleware')
const rateLimitMiddleware = require('./rateLimit.middleware')

module.exports = Object.freeze({
  requestLoggerMiddleware,
  rateLimitMiddleware
})

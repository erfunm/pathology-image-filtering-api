const { ResponseError } = require('../common')
const { rateLimit } = require('express-rate-limit')

module.exports = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: new ResponseError({
    message: 'Too many requests, please try again later.',
    code: 'TOO_MANY_REQUESTS',
    statusCode: 429,
    error: 'TooManyRequests'
  })
})

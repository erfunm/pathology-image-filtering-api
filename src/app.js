const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const multer = require('multer')()
const cors = require('cors')

const app = express()

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '127.0.0.1'

const { requestLoggerMiddleware, rateLimitMiddleware } = require('./frameworks/middlewares')

const routes = require('./frameworks/webserver/routes')

const ErrorHandler = require('./frameworks/webserver/ErrorHandler')

const dependencies =
  process.env.NODE_ENV === 'production'
    ? require('./config/dependencies.prd')({ storages: process.env.STORAGES.split(',') })
    : require('./config/dependencies.dev')({ storages: process.env.STORAGES.split(',') })

const CORSWhitelist = process.env?.CORS_WHITELIST?.split(',') ?? []

const ApiPrefix = process.env?.API_PREFIX ?? '/api/v1'

const fileUpload = multer.fields([{ name: 'file', maxCount: 1 }])

// Application actions
const start = function () {
  // Security
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  // middlewares
  app.use(helmet())
  app.use(rateLimitMiddleware)
  app.use(
    cors({
      origin: function (origin, callback) {
        if (typeof origin === 'undefined') return callback(null, true)
        if (CORSWhitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error(origin + ' is not allowed by CORS'))
        }
      }
    })
  )
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(fileUpload)
  app.use(requestLoggerMiddleware)
  // routes
  app.use(ApiPrefix, routes(dependencies))
  // common error handler
  app.use(ErrorHandler)
  // start server
  app.listen(PORT, HOST, () => {
    console.log('app is running on port %d', PORT)
  })
}

module.exports = {
  start
}

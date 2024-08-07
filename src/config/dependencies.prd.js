const middlewares = require('../frameworks/middlewares')
const useCases = require('../useCases')
const repositories = require('../frameworks/repositories/postgres')
const memoryStorage = {}

const AWS = require('aws-sdk')
require('aws-sdk/lib/maintenance_mode_message').suppress = true
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   endpoint: process.env.AWS_ENDPOINT_URL
// })
// const S3 = new AWS.S3({ params: { Bucket: process.env.AWS_BUCKET } })

module.exports = {
  // AWS: {
  //   S3
  // },
  memoryStorage,
  useCases,
  middlewares,
  ...repositories
}

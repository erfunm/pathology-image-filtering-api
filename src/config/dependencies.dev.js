const middlewares = require('../frameworks/middlewares')
const useCases = require('../useCases')
const memoryStorage = {}

module.exports = ({ storages = [] }) => {
  const envConfig = {}
  for (let key in process.env) {
    if (key.startsWith('APP_')) {
      envConfig[key] = process.env[key]
    }
  }

  let configs = {
    useCases,
    middlewares,
    envConfig
  }
  if (storages.includes('memory')) {
    configs.memoryStorage = memoryStorage
  }
  if (storages.includes('aws:s3')) {
    const AWS = require('aws-sdk')
    require('aws-sdk/lib/maintenance_mode_message').suppress = true
    // AWS.config.update({
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //   endpoint: process.env.AWS_ENDPOINT_URL
    // })
    // const S3 = new AWS.S3({ params: { Bucket: process.env.AWS_BUCKET } })
    configs.AWS = {
      S3
    }
  }
  if (storages.includes('postgres')) {
    const repositories = require('../frameworks/repositories/postgres')
    configs = {
      ...configs,
      ...repositories
    }
  }
  return configs
}

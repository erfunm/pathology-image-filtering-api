const { ResponseError } = require('../../frameworks/common')

const path = require('path')
const { statSync, readFileSync } = require('fs')
const mime = require('mime-types')

module.exports = (dependecies) => {
  const {
    envConfig: { APP_CONTENT_PATH }
  } = dependecies

  const execute = ({ InstagramID, fileName }) => {
    const imagePath = path.resolve(APP_CONTENT_PATH, InstagramID, fileName)
    return {
      Path: imagePath,
      ContentType: mime.lookup(imagePath),
      ContentLength: statSync(imagePath).size,
      Body: readFileSync(imagePath),
    }
  }

  return { execute }
}

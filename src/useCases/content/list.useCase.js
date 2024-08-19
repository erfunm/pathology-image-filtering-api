const path = require('path')
const { ResponseError } = require('../../frameworks/common')
const { readdir } = require('fs')

module.exports = (dependecies) => {
  const {
    envConfig: { APP_CONTENT_PATH }
  } = dependecies

  const execute = async () => {
    const contentPath = path.resolve(APP_CONTENT_PATH)
    const list = await new Promise((resolve, reject) => {
      readdir(contentPath, (err, files) => {
        if (err) {
          reject(new ResponseError(err.message, 500))
        }
        resolve(files)
      })
    })
    return {
      total: list.length,
      list
    }
  }

  return { execute }
}

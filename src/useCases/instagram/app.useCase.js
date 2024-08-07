const { ResponseError } = require('../../frameworks/common')

module.exports = (dependecies) => {
  // const { instaRepository } = dependecies
  // if (!instaRepository) {
  //   throw new Error('Instagram repository is required')
  // }
  const execute = async () => {
    return {
      message: 'Hello from Instagram App'
    }
  }

  return { execute }
}

const { User } = require('../../entities')
const { ResponseError } = require('../../frameworks/common')

module.exports = (dependecies) => {
  const { userRepository } = dependecies
  if (!userRepository) {
    throw new Error('User repository is required')
  }

  const verify = async (user) => {
    if (!user) {
      throw new ResponseError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'invalid authorization token'
      })
    }
    return user
  }

  const execute = async (cond = {}, isAdmin = false) => {
    if (cond.email) {
      cond.email = `%${cond.email}%`
    }
    const existedUser = await userRepository.getUser(cond, isAdmin)
    if (!existedUser) {
      return null
    }
    if (isAdmin) {
      return existedUser.dataValues
    }
    return User.DTO(existedUser)
  }

  return { verify, execute }
}

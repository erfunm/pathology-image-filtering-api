module.exports = (dependecies) => {
  const { userRepository } = dependecies
  if (!userRepository) {
    throw new Error('User repository is required')
  }

  const execute = async (cond = {}) => {
    try {
      const existedUser = await userRepository.getUser(cond)
      if (!existedUser) {
        return null
      }
      return existedUser?.dataValues?.id ?? null
    } catch (error) {
      throw new Error(error)
    }
  }

  return { execute }
}

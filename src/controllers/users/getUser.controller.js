const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      users: { getUserUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const {
        locals: { user }
      } = res

      const getUser = getUserUseCase(dependencies)
      const verifiedUser = await getUser.verify(user)
      const content = await getUser.execute({ uid: verifiedUser.uid }, false)

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      instagram: { appUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const app = appUseCase(dependencies)
      const content = await app.execute()

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

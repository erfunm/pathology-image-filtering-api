const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      content: { listUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const GetList = listUseCase(dependencies)
      const content = await GetList.execute()

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

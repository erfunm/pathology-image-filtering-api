const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      content: { profileUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const { params: { profileId: InstagramID }, query: { filter: ContentType = 'all', page = 1 } } = req

      const ProfileContent = profileUseCase(dependencies)
      const content = await ProfileContent.execute({
        InstagramID,
        ContentType,
        page
      })

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      content: { deleteFileUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const { params: { profileId: InstagramID, fileName } } = req

      const DeleteFile = deleteFileUseCase(dependencies)
      const content = await DeleteFile.execute({
        InstagramID,
        fileName
      })

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

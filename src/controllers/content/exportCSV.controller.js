const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      content: { exportCSVUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const { params: { profileId: InstagramID } } = req

      const GetFile = exportCSVUseCase(dependencies)
      const content = await GetFile.execute({
        InstagramID
      })

      res.setHeader('Content-Type', content.ContentType)
      res.setHeader('Content-Length', content.ContentLength)
      res.setHeader('Content-Disposition', `attachment; filename=${content.FileName}`)
      res.end(content.Body)

      next()
    } catch (error) {
      next(error)
    }
  }
}

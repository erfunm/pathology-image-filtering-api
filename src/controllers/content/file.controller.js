const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      content: { fileUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const { params: { profileId: InstagramID, fileName }, query: { download } } = req

      const GetFile = fileUseCase(dependencies)
      const content = await GetFile.execute({
        InstagramID,
        fileName
      })

      res.setHeader('Content-Type', content.ContentType)
      res.setHeader('Content-Length', content.ContentLength)

      if (typeof download !== 'undefined') {
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)
      }

      res.end(content.Body)

      next()
    } catch (error) {
      next(error)
    }
  }
}

const { Response } = require('../../frameworks/common')

module.exports = (dependencies) => {
  const {
    useCases: {
      content: { exportListCSVUseCase }
    }
  } = dependencies

  return async (req, res, next) => {
    try {
      const ExportCSV = exportListCSVUseCase(dependencies)
      // const content = await ExportCSV.execute()
      const content = await ExportCSV.GPTResultToCSV()

      const response = new Response({ content })
      res.status(response.status).json(response)

      next()
    } catch (error) {
      next(error)
    }
  }
}

module.exports = async (req, res, next) => {
  try {
    const { url, method } = req

    console.log('> [%s] %s', method, url)

    next()
  } catch (error) {
    next(error)
  }
}

const { Response, ResponseError } = require('../common')

module.exports = (err, req, res, next) => {
  switch (err.name) {
    case 'TokenExpiredError':
      err.status = 401
      err.code = 'UNAUTHORIZED'
      err.msg = 'authorization token is required'
      break
    case 'ECONNREFUSED':
      err.status = 504
      err.code = 'GATEWAY_TIMEOUT'
      err.msg = 'Gateway Timeout'
      break
    case 'ValidationError':
      err.status = 400
      err.code = 'BAD_REQUEST'
      err.msg = 'Bad Request'
      break
  }
  const errorObj = {
    status: err.status || 500,
    code: err.code || '-1',
    message: err?.msg ?? err?.message ?? 'Internal Server Error',
    details: {
      url: req.originalUrl,
      ip: req.ip,
      agent: req.headers['user-agent'],
      stack: err?.stack ?? null,
      validationErrors: err.validationErrors
    }
  }

  const error = new ResponseError(errorObj)

  res.status(errorObj.status).json(
    new Response({
      status: false,
      error
    })
  )
}

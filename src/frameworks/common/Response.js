const http = require('http')

class Response {
  constructor ({ status = true, error = null, content = null }) {
    const isResponseError = ResponseError.isResponseError(error || content)
    const isValidationError = ValidationError.isValidationError(
      error || content
    )
    this.success = isResponseError || isValidationError ? false : status
    this.error = isResponseError || isValidationError ? error || content : null
    this.content = isResponseError || isValidationError ? null : content
    this.status =
      isResponseError || isValidationError
        ? http.STATUS_CODES[String(this.error?.status ?? '500')] ||
        'Internal Server Error'
        : http.STATUS_CODES[String(this.content?.status ?? '200')] || 'OK'
    this.status = Number(
      Object.keys(http.STATUS_CODES)[
      Object.values(http.STATUS_CODES).findIndex(
        (code) => code === this.status
      )
      ]
    )
  }
}

class ResponseError {
  constructor ({
    status,
    code = null,
    message = null,
    details = {},
    validationErrors = []
  }) {
    this.status = status
    this.code = code
    this.message = message
    this.details = process.env.DEBUG == 'true' ? details : {}
    this.validationErrors = validationErrors
  }

  static isResponseError(error) {
    return error instanceof ResponseError
  }
}

class ValidationError {
  constructor ({ field, message }) {
    this.field = field
    this.message = message
  }

  static isValidationError(error) {
    return error instanceof ValidationError
  }
}

module.exports = Object.freeze({
  Response,
  ResponseError,
  ValidationError
})

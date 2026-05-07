class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function sendError(res, statusCode, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: { message, ...(details ? { details } : {}) }
  });
}

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

module.exports = { ApiError, sendError, sendSuccess };

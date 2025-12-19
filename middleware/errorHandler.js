const { logger } = require("../logger");

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const detail = err.detail || err.message || "Internal Server Error";

  logger.error("Unhandled error", { status, detail, stack: err.stack });

  res.status(status).json({ error: { status, detail } });
}

module.exports = { errorHandler };

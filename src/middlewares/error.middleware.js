import { HTTP_STATUS } from "../config/constants.js";
import logger from "../config/logger.js";
import { errorResponse } from "../utils/response.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? "Internal server error"
      : err.message;

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    error: err.message,
  });

  res.status(statusCode).json(errorResponse(message));
};

export default errorMiddleware;

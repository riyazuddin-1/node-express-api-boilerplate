import { HTTP_STATUS } from "../config/constants.js";
import { errorResponse } from "../utils/response.js";

const notFoundMiddleware = (req, res) => {
  res
    .status(HTTP_STATUS.NOT_FOUND)
    .json(errorResponse(`Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFoundMiddleware;

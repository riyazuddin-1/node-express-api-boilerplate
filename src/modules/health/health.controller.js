import { HTTP_STATUS } from "../../config/constants.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { getHealth } from "./health.service.js";

export const healthCheck = asyncHandler(async (req, res) => {
  res
    .status(HTTP_STATUS.OK)
    .json(successResponse(getHealth(), "Service is healthy"));
});

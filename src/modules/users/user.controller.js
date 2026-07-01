import { HTTP_STATUS } from "../../config/constants.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import * as userService from "./user.service.js";

export const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();

  res
    .status(HTTP_STATUS.OK)
    .json(successResponse(users, "Users fetched successfully"));
});

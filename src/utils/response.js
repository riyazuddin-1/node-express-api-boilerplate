export const successResponse = (data, message = "Success") => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message, details = null) => {
  return {
    success: false,
    message,
    ...(details ? { details } : {}),
  };
};

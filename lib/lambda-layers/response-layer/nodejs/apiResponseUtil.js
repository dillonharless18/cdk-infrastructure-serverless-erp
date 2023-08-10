import { getHeaders } from "/opt/nodejs/errors.js";

const buildApiResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: getHeaders(),
  };
};

const createErrorResponse = (errorObject) => {
  return buildApiResponse(errorObject.statusCode || 500, {
    error: errorObject.message || "Internal Server Error",
  });
};

const createSuccessResponse = (bodyObject) => {
  return buildApiResponse(200, JSON.stringify(bodyObject));
};

export { createErrorResponse, createSuccessResponse };

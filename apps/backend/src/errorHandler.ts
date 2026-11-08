import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errors/ApiError";
import { ApiErrorResponse, ERROR_CODES } from "@emour/core";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  console.error(err);

  return res.status(500).json({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "Internal server error",
  });
}
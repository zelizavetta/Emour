import {
  ApiErrorDetails,
  ERROR_CODES,
  ErrorCode,
  ValidationDetails,
} from "@emour/core";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: ApiErrorDetails;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: ApiErrorDetails
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static validation(
    message = "Validation failed",
    details?: ValidationDetails
  ) {
    return new ApiError(400, ERROR_CODES.VALIDATION_ERROR, message, details);
  }

  static unauthorized(message = "Unauthorized", details?: ApiErrorDetails) {
    return new ApiError(401, ERROR_CODES.UNAUTHORIZED, message, details);
  }

  static forbidden(message = "Forbidden", details?: ApiErrorDetails) {
    return new ApiError(403, ERROR_CODES.FORBIDDEN, message, details);
  }

  static notFound(message = "Not found", details?: ApiErrorDetails) {
    return new ApiError(404, ERROR_CODES.NOT_FOUND, message, details);
  }

  static conflict(message = "Conflict", details?: ApiErrorDetails) {
    return new ApiError(409, ERROR_CODES.CONFLICT, message, details);
  }

  static internal(
    message = "Internal server error",
    details?: ApiErrorDetails
  ) {
    return new ApiError(500, ERROR_CODES.INTERNAL_ERROR, message, details);
  }
}
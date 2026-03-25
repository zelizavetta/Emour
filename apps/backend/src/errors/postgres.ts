import { ApiError } from "./ApiError";

// 23505 unique_violation
// 23503 foreign_key_violation
// 22P02 invalid_text_representation
// 23502 not_null_violation

export function mapPostgresError(err: any): ApiError | null {
  if (!err || typeof err !== "object") return null;
  const code = err.code as string | undefined;
  if (!code) return null;

  switch (code) {
    case "23505":
      return ApiError.conflict("DUPLICATE", "Already exists");
    case "23503":
      return ApiError.conflict("FK_VIOLATION", "Cannot delete/update due to related records");
    case "23502":
      return ApiError.badRequest("NOT_NULL_VIOLATION", "Missing required field");
    case "22P02":
      return ApiError.badRequest("INVALID_FORMAT", "Invalid id/format");
    default:
      return ApiError.internal("Database error");
  }
}
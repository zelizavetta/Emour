import { ApiError } from "./ApiError";
import { FIELD_ERRORS } from "@emour/core";

type PgErrorLike = {
  code?: string;
  column?: string;
  constraint?: string;
};

export function mapPostgresError(err: unknown): ApiError | null {
  if (!err || typeof err !== "object") return null;

  const pgError = err as PgErrorLike;
  const code = pgError.code;
  if (!code) return null;

  switch (code) {
    case "23505": {
      const field = parseUniqueConstraint(pgError.constraint);

      return ApiError.conflict("Already exists", {
        fields: field
          ? {
              [field]: {
                code: FIELD_ERRORS.ALREADY_EXISTS,
              },
            }
          : undefined,
      });
    }

    case "23503":
      return ApiError.conflict("Foreign key violation", {
        reason: "FK_CONSTRAINT",
      });

    case "23502":
      return ApiError.validation("Validation failed", {
        fields: {
          [pgError.column ?? "unknown"]: {
            code: FIELD_ERRORS.REQUIRED,
          },
        },
      });

    case "22P02":
      return ApiError.validation("Validation failed", {
        fields: {
          id: {
            code: FIELD_ERRORS.INVALID,
            message: "Invalid id format",
          },
        },
      });

    default:
      return ApiError.internal("Database error", {
        pgCode: code,
      });
  }
}

function parseUniqueConstraint(constraint?: string): string | null {
  if (!constraint) return null;

  const match = constraint.match(/^[^_]+_(.+?)_key$/);
  return match?.[1] ?? null;
}
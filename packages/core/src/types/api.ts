export type ApiResponse<T> = {
  data: T
  meta?: {
    message?: string
    total?: number
    page?: number
    pageSize?: number
  }
}

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export const FIELD_ERRORS = {
  REQUIRED: "REQUIRED",
  INVALID: "INVALID",
  TOO_SHORT: "TOO_SHORT",
  TOO_LONG: "TOO_LONG",
  ALREADY_EXISTS: "ALREADY_EXISTS",
} as const;

export type FieldErrorCode =
  typeof FIELD_ERRORS[keyof typeof FIELD_ERRORS];

export type ValidationDetails = {
  fields?: Record<
    string,
    {
      code: FieldErrorCode;
      message?: string;
    }
  >;
};

export type ApiErrorDetails =
  | ValidationDetails
  | Record<string, unknown>
  | undefined;

export type ApiErrorResponse = {
  code: ErrorCode;
  message: string;
  details?: ApiErrorDetails;
};
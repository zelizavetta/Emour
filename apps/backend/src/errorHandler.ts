import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./errors/ApiError";
import { mapPostgresError } from "./errors/postgres";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // Лог
  console.error("ERROR:", {
    method: req.method,
    path: req.path,
    message: err?.message,
    code: err?.code,
    stack: err?.stack,
  });

  // Если это ошибка Postgres — маппим
  const pgMapped = mapPostgresError(err);
  if (pgMapped) {
    return res.status(pgMapped.status).json({
      error: pgMapped.code,
      message: pgMapped.message,
    });
  }

  // Если это ApiError
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.code,
      message: err.message,
      ...(process.env.NODE_ENV !== "production" && err.details ? { details: err.details } : {}),
    });
  }

  // Фолбек
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Internal server error",
  });
}
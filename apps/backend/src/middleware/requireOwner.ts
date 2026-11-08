import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../errors/ApiError'

// Blocks any mutating request (non-GET) for viewer-role tokens.
// Must run after requireAuth, which sets res.locals.role.
export function blockViewerWrites(req: Request, res: Response, next: NextFunction) {
  if (res.locals.role === 'viewer' && req.method !== 'GET') {
    throw ApiError.forbidden('Read-only access')
  }
  next()
}

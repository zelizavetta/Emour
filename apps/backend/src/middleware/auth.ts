import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../errors/ApiError'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized()
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { auth?: boolean; role?: string }
    // Tokens issued before roles existed have no role → treat as owner (backward compatible).
    res.locals.role = payload.role ?? 'owner'
    next()
  } catch {
    throw ApiError.unauthorized()
  }
}

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../errors/ApiError'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized()
  }

  const token = header.slice(7)
  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    next()
  } catch {
    throw ApiError.unauthorized()
  }
}

import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { asyncHandler } from '../asyncHandler'
import { ApiError } from '../errors/ApiError'
import { ApiSuccess } from '../success/ApiSuccess'

export const router = express.Router()

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  let role: 'owner' | 'viewer' | null = null

  if (email === process.env.APP_EMAIL && password === process.env.APP_PASSWORD) {
    role = 'owner'
  } else if (
    process.env.VIEWER_EMAIL &&
    email === process.env.VIEWER_EMAIL &&
    password === process.env.VIEWER_PASSWORD
  ) {
    role = 'viewer'
  }

  if (!role) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const token = jwt.sign({ auth: true, role }, process.env.JWT_SECRET!, { expiresIn: '90d' })

  ApiSuccess.ok(res, { token, role })
}))

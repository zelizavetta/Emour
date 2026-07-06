import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { asyncHandler } from '../asyncHandler'
import { ApiError } from '../errors/ApiError'
import { ApiSuccess } from '../success/ApiSuccess'

export const router = express.Router()

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (
    email !== process.env.APP_EMAIL ||
    password !== process.env.APP_PASSWORD
  ) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const token = jwt.sign({ auth: true }, process.env.JWT_SECRET!, { expiresIn: '90d' })

  ApiSuccess.ok(res, { token })
}))

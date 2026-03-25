import { TokenPayload } from '../auth/tokens'

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload
    }
  }
}

export {}

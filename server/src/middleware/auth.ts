import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'ai-email-validator-secret-key-2024'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    req.userId = decoded.userId
    req.userEmail = decoded.email
    next()
  } catch {
    res.status(403).json({ success: false, error: 'Invalid or expired token' })
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

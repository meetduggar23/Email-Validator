import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../database'
import { generateToken } from '../middleware/auth'

export function register(req: Request, res: Response): void {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      res.status(400).json({ success: false, error: 'All fields are required' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
      return
    }
    const db = getDb()
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      res.status(409).json({ success: false, error: 'Email already registered' })
      return
    }
    const id = uuidv4()
    const hashedPassword = bcrypt.hashSync(password, 10)
    db.prepare(
      'INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)'
    ).run(id, email, name, hashedPassword)
    const token = generateToken(id, email)
    res.status(201).json({
      success: true,
      data: { token, user: { id, email, name, createdAt: new Date().toISOString(), preferences: { theme: 'light', notifications: true, exportFormat: 'csv', apiSource: 'public' } } },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
}

export function login(req: Request, res: Response): void {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' })
      return
    }
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }
    const token = generateToken(user.id, user.email)
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at,
          preferences: {
            theme: user.theme,
            notifications: !!user.notifications,
            exportFormat: user.export_format,
            apiSource: user.api_source,
          },
        },
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' })
  }
}

export function getProfile(req: Request, res: Response): void {
  try {
    const { userId } = req as any
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        preferences: {
          theme: user.theme,
          notifications: !!user.notifications,
          exportFormat: user.export_format,
          apiSource: user.api_source,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get profile' })
  }
}

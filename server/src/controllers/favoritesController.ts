import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../database'
import { AuthRequest } from '../middleware/auth'

export function getFavorites(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const db = getDb()
    const items = db.prepare(`
      SELECT f.*, v.syntax_valid, v.confidence_score, v.provider, v.created_at as validated_at
      FROM favorites f
      LEFT JOIN validations v ON f.validation_id = v.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(authReq.userId) as any[]

    res.json({
      success: true,
      data: items.map(f => ({
        id: f.id,
        email: f.email,
        label: f.label,
        isValid: !!f.syntax_valid,
        provider: f.provider,
        confidenceScore: f.confidence_score,
        createdAt: f.created_at,
        validatedAt: f.validated_at,
      })),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get favorites' })
  }
}

export function addFavorite(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { email, validationId, label } = req.body
    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' })
      return
    }
    const db = getDb()
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND email = ?').get(authReq.userId, email) as any
    if (existing) {
      res.json({ success: true, data: { id: existing.id, message: 'Already in favorites' } })
      return
    }
    const id = uuidv4()
    db.prepare('INSERT INTO favorites (id, user_id, validation_id, email, label) VALUES (?, ?, ?, ?, ?)').run(
      id, authReq.userId, validationId || null, email, label || ''
    )
    res.json({ success: true, data: { id } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add favorite' })
  }
}

export function removeFavorite(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const db = getDb()
    db.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(id, authReq.userId)
    res.json({ success: true, message: 'Removed from favorites' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove favorite' })
  }
}

export function checkFavorite(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { email } = req.params
    const db = getDb()
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND email = ?').get(authReq.userId, decodeURIComponent(email)) as any
    res.json({ success: true, data: { isFavorite: !!existing, id: existing?.id || null } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check favorite' })
  }
}

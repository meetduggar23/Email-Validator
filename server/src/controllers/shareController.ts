import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../database'
import { AuthRequest } from '../middleware/auth'

export function shareValidation(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { validationId } = req.body
    if (!validationId) {
      res.status(400).json({ success: false, error: 'Validation ID is required' })
      return
    }
    const db = getDb()
    const validation = db.prepare('SELECT * FROM validations WHERE id = ?').get(validationId) as any
    if (!validation) {
      res.status(404).json({ success: false, error: 'Validation not found' })
      return
    }

    const token = uuidv4()
    const shareId = uuidv4()
    db.prepare('INSERT INTO share_tokens (id, validation_id, token) VALUES (?, ?, ?)').run(shareId, validationId, token)

    const shareUrl = `${req.protocol}://${req.get('host')}/api/share/${token}`

    res.json({ success: true, data: { token, shareUrl, id: shareId } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to share validation' })
  }
}

export function getSharedValidation(req: Request, res: Response): void {
  try {
    const { token } = req.params
    const db = getDb()
    const share = db.prepare('SELECT * FROM share_tokens WHERE token = ?').get(token) as any
    if (!share) {
      res.status(404).json({ success: false, error: 'Shared validation not found or expired' })
      return
    }

    const validation = db.prepare('SELECT * FROM validations WHERE id = ?').get(share.validation_id) as any
    if (!validation) {
      res.status(404).json({ success: false, error: 'Validation not found' })
      return
    }

    const result = validation.result_json ? JSON.parse(validation.result_json) : {}
    res.json({
      success: true,
      data: {
        email: validation.email,
        isValid: !!validation.syntax_valid,
        provider: validation.provider,
        confidenceScore: validation.confidence_score,
        healthScore: result.healthScore || validation.confidence_score,
        explanation: result.explanation || '',
        timestamp: validation.created_at,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get shared validation' })
  }
}

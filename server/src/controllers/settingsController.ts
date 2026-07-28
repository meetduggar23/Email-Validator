import { Request, Response } from 'express'
import { getDb } from '../database'
import { AuthRequest } from '../middleware/auth'

export function getSettings(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authReq.userId) as any
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }
    res.json({
      success: true,
      data: {
        theme: user.theme,
        notifications: !!user.notifications,
        exportFormat: user.export_format,
        apiSource: user.api_source,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get settings' })
  }
}

export function updateSettings(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { theme, notifications, exportFormat, apiSource } = req.body
    const db = getDb()
    db.prepare(`
      UPDATE users SET theme = ?, notifications = ?, export_format = ?, api_source = ?
      WHERE id = ?
    `).run(theme || 'light', notifications ? 1 : 0, exportFormat || 'csv', apiSource || 'public', authReq.userId)
    res.json({ success: true, message: 'Settings updated' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update settings' })
  }
}

export function deleteAccount(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const db = getDb()
    db.prepare('DELETE FROM validations WHERE user_id = ?').run(authReq.userId)
    db.prepare('DELETE FROM bulk_jobs WHERE user_id = ?').run(authReq.userId)
    db.prepare('DELETE FROM users WHERE id = ?').run(authReq.userId)
    res.json({ success: true, message: 'Account deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete account' })
  }
}

import { Request, Response } from 'express'
import { getDb } from '../database'

export function getHistory(req: Request, res: Response): void {
  try {
    const db = getDb()
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    const search = (req.query.search as string) || ''
    const provider = (req.query.provider as string) || ''
    const status = (req.query.status as string) || ''
    const sortBy = (req.query.sortBy as string) || 'created_at'
    const sortOrder = (req.query.sortOrder as string) || 'desc'

    const allowedSortColumns = ['created_at', 'confidence_score', 'email', 'provider']
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'

    let query = 'SELECT * FROM validations WHERE 1=1'
    let countQuery = 'SELECT COUNT(*) as total FROM validations WHERE 1=1'
    const params: any[] = []
    const countParams: any[] = []

    if (search) {
      query += ' AND email LIKE ?'
      countQuery += ' AND email LIKE ?'
      params.push(`%${search}%`)
      countParams.push(`%${search}%`)
    }

    if (provider) {
      query += ' AND provider = ?'
      countQuery += ' AND provider = ?'
      params.push(provider)
      countParams.push(provider)
    }

    if (status === 'valid') {
      query += ' AND syntax_valid = 1 AND is_disposable = 0'
      countQuery += ' AND syntax_valid = 1 AND is_disposable = 0'
    } else if (status === 'invalid') {
      query += ' AND syntax_valid = 0'
      countQuery += ' AND syntax_valid = 0'
    } else if (status === 'disposable') {
      query += ' AND is_disposable = 1'
      countQuery += ' AND is_disposable = 1'
    }

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const total = (db.prepare(countQuery).get(...countParams) as any).total
    const items = db.prepare(query).all(...params) as any[]

    res.json({
      success: true,
      data: {
        items: items.map((v: any) => ({
          id: v.id,
          email: v.email,
          isValid: !!v.syntax_valid,
          isDisposable: !!v.is_disposable,
          provider: v.provider,
          confidenceScore: v.confidence_score,
          healthScore: v.health_score || v.confidence_score,
          timestamp: v.created_at,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get history' })
  }
}

export function deleteHistoryItem(req: Request, res: Response): void {
  try {
    const { id } = req.params
    const db = getDb()
    db.prepare('DELETE FROM validations WHERE id = ?').run(id)
    res.json({ success: true, message: 'History item deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete history item' })
  }
}

export function clearHistory(_req: Request, res: Response): void {
  try {
    const db = getDb()
    db.prepare('DELETE FROM validations').run()
    res.json({ success: true, message: 'History cleared' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clear history' })
  }
}

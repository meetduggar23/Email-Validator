import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../database'
import { AuthRequest } from '../middleware/auth'

export function getCollections(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const db = getDb()
    const collections = db.prepare(`
      SELECT c.*, (SELECT COUNT(*) FROM collection_items ci WHERE ci.collection_id = c.id) as item_count
      FROM collections c
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `).all(authReq.userId) as any[]

    res.json({
      success: true,
      data: collections.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        color: c.color,
        itemCount: c.item_count,
        createdAt: c.created_at,
      })),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get collections' })
  }
}

export function createCollection(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { name, description, color } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: 'Collection name is required' })
      return
    }
    const db = getDb()
    const id = uuidv4()
    db.prepare('INSERT INTO collections (id, user_id, name, description, color) VALUES (?, ?, ?, ?, ?)').run(
      id, authReq.userId, name, description || '', color || '#4F46E5'
    )
    res.json({ success: true, data: { id, name, description, color } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create collection' })
  }
}

export function updateCollection(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const { name, description, color } = req.body
    const db = getDb()
    db.prepare('UPDATE collections SET name = COALESCE(?, name), description = COALESCE(?, description), color = COALESCE(?, color) WHERE id = ? AND user_id = ?').run(
      name || null, description !== undefined ? description : null, color || null, id, authReq.userId
    )
    res.json({ success: true, message: 'Collection updated' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update collection' })
  }
}

export function deleteCollection(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const db = getDb()
    db.prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(id, authReq.userId)
    res.json({ success: true, message: 'Collection deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete collection' })
  }
}

export function getCollectionItems(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const db = getDb()
    const items = db.prepare(`
      SELECT ci.*, v.syntax_valid, v.confidence_score, v.provider
      FROM collection_items ci
      LEFT JOIN validations v ON ci.validation_id = v.id
      WHERE ci.collection_id = ? AND ci.collection_id IN (SELECT id FROM collections WHERE user_id = ?)
      ORDER BY ci.added_at DESC
    `).all(id, authReq.userId) as any[]

    res.json({
      success: true,
      data: items.map(i => ({
        id: i.id,
        email: i.email,
        isValid: !!i.syntax_valid,
        provider: i.provider,
        confidenceScore: i.confidence_score,
        addedAt: i.added_at,
      })),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get collection items' })
  }
}

export function addToCollection(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const { email, validationId } = req.body
    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' })
      return
    }
    const db = getDb()
    const collection = db.prepare('SELECT id FROM collections WHERE id = ? AND user_id = ?').get(id, authReq.userId) as any
    if (!collection) {
      res.status(404).json({ success: false, error: 'Collection not found' })
      return
    }
    const existing = db.prepare('SELECT id FROM collection_items WHERE collection_id = ? AND email = ?').get(id, email) as any
    if (existing) {
      res.json({ success: true, data: { id: existing.id, message: 'Already in collection' } })
      return
    }
    const itemId = uuidv4()
    db.prepare('INSERT INTO collection_items (id, collection_id, validation_id, email) VALUES (?, ?, ?, ?)').run(
      itemId, id, validationId || null, email
    )
    res.json({ success: true, data: { id: itemId } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add to collection' })
  }
}

export function removeFromCollection(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const { id, itemId } = req.params
    const db = getDb()
    db.prepare(`
      DELETE FROM collection_items WHERE id = ? AND collection_id IN (SELECT id FROM collections WHERE user_id = ?)
    `).run(itemId, authReq.userId)
    res.json({ success: true, message: 'Removed from collection' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove from collection' })
  }
}

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getCollections, createCollection, updateCollection, deleteCollection,
  getCollectionItems, addToCollection, removeFromCollection,
} from '../controllers/collectionsController'

const router = Router()

router.get('/', authenticateToken, getCollections)
router.post('/', authenticateToken, createCollection)
router.put('/:id', authenticateToken, updateCollection)
router.delete('/:id', authenticateToken, deleteCollection)
router.get('/:id/items', authenticateToken, getCollectionItems)
router.post('/:id/items', authenticateToken, addToCollection)
router.delete('/:id/items/:itemId', authenticateToken, removeFromCollection)

export default router

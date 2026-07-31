import { Router } from 'express'
import { getHistory, deleteHistoryItem, clearHistory } from '../controllers/historyController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, getHistory)
router.delete('/:id', authenticateToken, deleteHistoryItem)
router.delete('/', authenticateToken, clearHistory)

export default router

import { Router } from 'express'
import { getHistory, deleteHistoryItem, clearHistory } from '../controllers/historyController'

const router = Router()

router.get('/', getHistory)
router.delete('/:id', deleteHistoryItem)
router.delete('/', clearHistory)

export default router

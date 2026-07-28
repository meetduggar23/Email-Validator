import { Router } from 'express'
import { getSettings, updateSettings, deleteAccount } from '../controllers/settingsController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, getSettings)
router.put('/', authenticateToken, updateSettings)
router.delete('/account', authenticateToken, deleteAccount)

export default router

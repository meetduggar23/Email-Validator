import { Router } from 'express'
import { shareValidation, getSharedValidation } from '../controllers/shareController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', authenticateToken, shareValidation)
router.get('/:token', getSharedValidation)

export default router

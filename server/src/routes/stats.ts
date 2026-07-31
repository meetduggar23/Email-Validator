import { Router } from 'express'
import { getDashboardStats, getStats } from '../controllers/statsController'
import { optionalAuthenticateToken } from '../middleware/auth'

const router = Router()

router.get('/dashboard', optionalAuthenticateToken, getDashboardStats)
router.get('/', optionalAuthenticateToken, getStats)

export default router

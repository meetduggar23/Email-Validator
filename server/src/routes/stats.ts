import { Router } from 'express'
import { getDashboardStats, getStats } from '../controllers/statsController'

const router = Router()

router.get('/dashboard', getDashboardStats)
router.get('/', getStats)

export default router

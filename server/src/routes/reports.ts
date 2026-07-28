import { Router } from 'express'
import { exportCSV, exportJSON, getReportSummary } from '../controllers/reportsController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/csv', authenticateToken, exportCSV)
router.get('/json', authenticateToken, exportJSON)
router.get('/summary', authenticateToken, getReportSummary)

export default router

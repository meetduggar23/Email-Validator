import { Router } from 'express'
import { exportCSV, exportJSON, exportExcel, exportPDF, getReportSummary } from '../controllers/reportsController'

const router = Router()

router.get('/csv', exportCSV)
router.get('/json', exportJSON)
router.get('/excel', exportExcel)
router.get('/pdf', exportPDF)
router.get('/summary', getReportSummary)

export default router

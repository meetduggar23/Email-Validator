import { Router } from 'express'
import multer from 'multer'
import { uploadBulk, getBulkJobs, getBulkResults } from '../controllers/bulkController'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.post('/upload', authenticateToken, upload.single('file'), uploadBulk)
router.get('/jobs', authenticateToken, getBulkJobs)
router.get('/results/:jobId', authenticateToken, getBulkResults)

export default router

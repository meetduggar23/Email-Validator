import { Router } from 'express'
import multer from 'multer'
import { uploadBulk, getBulkJobs, getBulkResults } from '../controllers/bulkController'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.post('/upload', upload.single('file'), uploadBulk)
router.get('/jobs', getBulkJobs)
router.get('/results/:jobId', getBulkResults)

export default router

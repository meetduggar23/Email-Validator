import { Router } from 'express'
import { shareValidation, getSharedValidation } from '../controllers/shareController'

const router = Router()

router.post('/', shareValidation)
router.get('/:token', getSharedValidation)

export default router

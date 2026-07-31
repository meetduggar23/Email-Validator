import { Router } from 'express'
import { validateSingle } from '../controllers/validationController'
import { optionalAuthenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', optionalAuthenticateToken, (req, res, next) => {
  validateSingle(req, res).catch(next)
})

export default router

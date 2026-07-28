import { Router } from 'express'
import { validateSingle } from '../controllers/validationController'

const router = Router()

router.post('/', (req, res, next) => {
  validateSingle(req, res).catch(next)
})

export default router

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { getFavorites, addFavorite, removeFavorite, checkFavorite } from '../controllers/favoritesController'

const router = Router()

router.get('/', authenticateToken, getFavorites)
router.post('/', authenticateToken, addFavorite)
router.delete('/:id', authenticateToken, removeFavorite)
router.get('/check/:email', authenticateToken, checkFavorite)

export default router

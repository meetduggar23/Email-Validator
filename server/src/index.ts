import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { initDatabase } from './database'
import authRoutes from './routes/auth'
import validationRoutes from './routes/validation'
import bulkRoutes from './routes/bulk'
import historyRoutes from './routes/history'
import reportRoutes from './routes/reports'
import statsRoutes from './routes/stats'
import settingsRoutes from './routes/settings'
import favoritesRoutes from './routes/favorites'
import collectionsRoutes from './routes/collections'
import shareRoutes from './routes/share'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 3001

initDatabase()

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/reports', express.static(path.join(__dirname, '../reports')))

app.use('/api/auth', authRoutes)
app.use('/api/validate', validationRoutes)
app.use('/api/bulk', bulkRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/share', shareRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Email Validator API is running' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app

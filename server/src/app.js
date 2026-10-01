import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config } from './config/env.js'

// Security Middlewares
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import xss from 'xss-clean'
import hpp from 'hpp'
import { requireAuth } from './middleware/auth.js'

import authRouter from './routes/auth.js'
import sectionsRouter from './routes/sections.js'
import defectsRouter from './routes/defects.js'
import blocksRouter from './routes/blocks.js'
import plansRouter from './routes/plans.js'
import analyticsRouter from './routes/analytics.js'
import syncRouter from './routes/sync.js'
import simulatorsRouter from './routes/simulators.js'
import railwayRouter from './routes/railway.js'
import uploadRouter from './routes/upload.js'
import aiRouter from './routes/ai.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(morgan('dev'))

// Security Middlewares
// 1. Set security HTTP headers
app.use(helmet())

// 2. Prevent XSS attacks
app.use(xss())

// 3. Prevent HTTP Parameter Pollution
app.use(hpp())

// 4. Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RailLink Express API Gateway',
    environment: config.nodeEnv,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Route Handlers
// Auth route is public (handles login)
app.use('/api/auth', authRouter)

// Protected Routes
app.use('/api/sections', requireAuth, sectionsRouter)
app.use('/api/defects', requireAuth, defectsRouter)
app.use('/api/blocks', requireAuth, blocksRouter)
app.use('/api/plans', requireAuth, plansRouter)
app.use('/api/analytics', requireAuth, analyticsRouter)
app.use('/api/sync', requireAuth, syncRouter)
app.use('/api/sim', requireAuth, simulatorsRouter)
app.use('/api/railway', requireAuth, railwayRouter)
app.use('/api/upload', requireAuth, uploadRouter)
app.use('/api/ai', requireAuth, aiRouter)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve built frontend assets if present (Render / Monorepo deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist')
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[RailLink API Error]:', err.stack)
  
  const isProduction = process.env.NODE_ENV === 'production'
  
  res.status(err.status || 500).json({
    error: isProduction && (!err.status || err.status === 500) 
      ? 'Internal Server Error' 
      : (err.message || 'Internal Server Error'),
    code: err.code || 'INTERNAL_ERROR'
  })
})

// Start server (only if not running in serverless / Vercel environment)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚆 RailLink API Gateway running on port ${config.port} [${config.nodeEnv}]`)
    console.log(`🔗 Health check available at: http://localhost:${config.port}/api/health`)
  })
}

export default app

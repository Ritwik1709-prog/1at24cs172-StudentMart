import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

const app = express()
const port = Number(process.env.PORT) || 5000
const rootDir = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.resolve(rootDir, '..', 'dist')

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Set MONGODB_URI and JWT_SECRET in your .env file.')
  process.exit(1)
}

app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
// Auto-launcher for local MongoDB if installed
let autoStartAttempted = false
function tryAutoStartLocalMongo() {
  const localMongoPaths = [
    { exe: 'D:\\MongoDB Community\\bin\\mongod.exe', cfg: 'D:\\MongoDB Community\\bin\\mongod.cfg' },
    { exe: 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe' },
    { exe: 'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe' },
  ]
  for (const item of localMongoPaths) {
    if (fs.existsSync(item.exe)) {
      try {
        console.log(`[MongoDB Auto-Start] Launching local MongoDB at ${item.exe}...`)
        const args = item.cfg && fs.existsSync(item.cfg) ? ['--config', item.cfg] : []
        const child = spawn(item.exe, args, { detached: true, stdio: 'ignore' })
        child.unref()
        return true
      } catch (err) {
        console.warn(`[MongoDB Auto-Start] Could not spawn ${item.exe}:`, err.message)
      }
    }
  }
  return false
}

// Database connection status middleware for API routes with async connection wait
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next()
  if (mongoose.connection.readyState !== 1) {
    if (mongoose.connection.readyState === 0) {
      connectDB().catch(() => {})
    }
    const start = Date.now()
    while (mongoose.connection.readyState !== 1 && (Date.now() - start) < 4500) {
      await new Promise(r => setTimeout(r, 150))
    }
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'MongoDB is starting up or disconnected. Please ensure MongoDB is running (npm run mongo:start) or configure MONGODB_URI in .env.',
    })
  }
  next()
})

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database_unavailable',
    database: connected ? mongoose.connection.name : 'disconnected',
  })
})
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist))
  app.get(/.*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
}
app.use((error, _req, res, _next) => {
  if (error?.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' })
  console.error(error)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
})

// Start server first so Vite proxy can always connect
app.listen(port, () => {
  console.log(`Student Mart API listening on http://localhost:${port}`)
})

// Auto-reconnecting MongoDB connection
let isConnecting = false
async function connectDB() {
  if (isConnecting || mongoose.connection.readyState === 1) return
  isConnecting = true
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`)
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to ${process.env.MONGODB_URI}: ${error.message}`)
    if (!autoStartAttempted) {
      autoStartAttempted = true
      if (tryAutoStartLocalMongo()) {
        console.log('[MongoDB] Auto-start triggered. Retrying connection in 2 seconds...')
        setTimeout(connectDB, 2000)
        return
      }
    }
    console.warn('[MongoDB Tip] Make sure MongoDB is running locally (npm run mongo:start) or set a cloud MongoDB Atlas URI in .env.')
    console.warn('[MongoDB] Will retry connection in 5 seconds...')
    setTimeout(connectDB, 5000)
  } finally {
    isConnecting = false
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected. Attempting to reconnect...')
  setTimeout(connectDB, 5000)
})

connectDB()

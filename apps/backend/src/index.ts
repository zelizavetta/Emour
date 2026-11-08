import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env' })
import express from 'express'
import cors from 'cors'
import { router as authRoutes } from './routes/auth'
import { router as feelingsRoutes } from './routes/feelings'
import { router as symptomsRoutes } from './routes/symptoms'
import { router as notesRoutes } from './routes/notes'
import { router as medsRoutes } from './routes/meds'
import { errorHandler } from './errorHandler'
import { requireAuth } from './middleware/auth'
import { blockViewerWrites } from './middleware/requireOwner'

const app = express()
app.use(express.json())
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.url)
  next()
})

app.get('/', (_req, res) => {
  res.send({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/feelings', requireAuth, blockViewerWrites, feelingsRoutes)
app.use('/api/symptoms', requireAuth, blockViewerWrites, symptomsRoutes)
app.use('/api/notes', requireAuth, blockViewerWrites, notesRoutes)
app.use('/api/meds', requireAuth, blockViewerWrites, medsRoutes)

app.use(errorHandler)

const PORT = 3002

const server = app.listen(PORT, '0.0.0.0')

server.on('listening', () => {
  console.log('API ACTUALLY LISTENING ON', PORT)
})

server.on('error', (err) => {
  console.error('LISTEN ERROR', err)
})

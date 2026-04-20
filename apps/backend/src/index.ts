import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env' })
import express from 'express'
import cors from 'cors'
import { router as feelingsRoutes } from './routes/feelings'
import { router as symptomsRoutes } from './routes/symptoms'
import { errorHandler } from './errorHandler'


const app = express()
app.use(express.json())

app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.url)
  next()
})

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.get('/', (req, res) => {
  res.send({ status: 'ok' })
})

app.use('/api/feelings', feelingsRoutes)
app.use('/api/symptoms', symptomsRoutes)

app.use(errorHandler);

// const PORT = process.env.PORT || 3002
// app.listen(PORT, () => {
//   console.log(`API running on ${process.env.API_URL}:${PORT}`)
// })

const PORT = 3002

const server = app.listen(PORT, '0.0.0.0')

server.on('listening', () => {
  console.log('API ACTUALLY LISTENING ON', PORT)
})

server.on('error', (err) => {
  console.error('LISTEN ERROR', err)
})

import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env' })
import express from 'express'
import cors from 'cors'
import { router as userRoutes } from './routes/users'
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

app.use('/api/auth', userRoutes)
app.use('/api/texts', textRoutes)
app.use('/api/dictionary', dictionaryRoutes)
app.use('/api/grammar', grammarRoutes)

app.use(errorHandler);

// const PORT = process.env.PORT || 3001
// app.listen(PORT, () => {
//   console.log(`API running on ${process.env.API_URL}:${PORT}`)
// })

const PORT = 3001

const server = app.listen(PORT, '0.0.0.0')

server.on('listening', () => {
  console.log('API ACTUALLY LISTENING ON', PORT)
})

server.on('error', (err) => {
  console.error('LISTEN ERROR', err)
})

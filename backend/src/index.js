require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
// 配置 CORS
app.use(cors({
  origin: 'https://campus-books-rosy.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/books', require('./routes/books'))
app.use('/api/reservations', require('./routes/reservations'))
app.use('/api/admin', require('./routes/admin'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`服务器运行在 http://localhost:${PORT}`))

require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/books', require('./routes/books'))
app.use('/api/reservations', require('./routes/reservations'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`)
})

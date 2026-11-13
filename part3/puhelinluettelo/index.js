require('dotenv').config()

const express = require('express')
const path = require('path')
const Person = require('./models/person')

const app = express()

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

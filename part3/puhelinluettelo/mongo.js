const mongoose = require('mongoose')

const password = process.argv[2]

if (!password) {
  console.log('Please provide the password as an argument')
  process.exit(1)
}

const url = `mongodb+srv://mishaalshahzad7_db_user:${password}@cluster0.k4eivxn.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

console.log('Connecting to database...')

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB!')

    const personSchema = new mongoose.Schema({
      name: String,
      number: String,
    })

    const Person = mongoose.model('Person', personSchema)

    if (process.argv.length === 5) {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })

      return person.save().then(() => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
      })
    } else {
      return Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach(p => console.log(`${p.name} ${p.number}`))
      })
    }
  })
  .then(() => {
    mongoose.connection.close()
  })
  .catch(err => {
    console.error('Error connecting to database:', err.message)
    mongoose.connection.close()
  })
import React, { useState, useEffect } from 'react'
import personService from './services/persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(() => {
        alert('Could not load people from the server')
      })
  }, [])

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleSearchChange = (event) => setSearchFilter(event.target.value)

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(
      person => person.name.toLowerCase() === newName.trim().toLowerCase()
    )

    const personObject = {
      name: newName.trim(),
      number: newNumber.trim()
    }

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${existingPerson.name} is already added to phonebook, replace the old number with a new one?`
      )

      if (!confirmUpdate) {
        return
      }

      personService
        .update(existingPerson.id, personObject)
        .then(returnedPerson => {
          setPersons(currentPersons =>
            currentPersons.map(person =>
              person.id === existingPerson.id ? returnedPerson : person
            )
          )
          setNewName('')
          setNewNumber('')
        })
        .catch(() => {
          alert(`Information of ${existingPerson.name} has already been removed from server`)
          setPersons(currentPersons =>
            currentPersons.filter(person => person.id !== existingPerson.id)
          )
        })
      return
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(currentPersons => currentPersons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
      .catch(() => {
        alert('Could not add the person to the server')
      })
  }

  const deletePerson = (id, name) => {
    if (!window.confirm(`Delete ${name} ?`)) {
      return
    }

    personService
      .remove(id)
      .then(() => {
        setPersons(currentPersons => currentPersons.filter(person => person.id !== id))
      })
      .catch(() => {
        alert(`Could not delete ${name} from the server`)
      })
  }

  const personsToShow = searchFilter === ''
    ? persons
    : persons.filter(person =>
        person.name.toLowerCase().includes(searchFilter.toLowerCase())
      )

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter
        searchFilter={searchFilter}
        handleSearchChange={handleSearchChange}
      />

      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons personsToShow={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App
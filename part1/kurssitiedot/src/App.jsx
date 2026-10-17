import React, { useState, useEffect, useRef } from 'react'
import personService from './services/persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')
  const notificationTimer = useRef(null)

  const showNotification = (message, type = 'success') => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current)
    }

    setNotificationMessage(message)
    setNotificationType(type)
    notificationTimer.current = setTimeout(() => {
      setNotificationMessage(null)
      notificationTimer.current = null
    }, 5000)
  }

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(() => {
        showNotification('Could not load people from the server', 'error')
      })
  }, [])

  useEffect(() => () => clearTimeout(notificationTimer.current), [])

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
          showNotification(`Updated ${returnedPerson.name}'s number`)
        })
        .catch(() => {
          showNotification(
            `Information of ${existingPerson.name} has already been removed from server`,
            'error'
          )
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
        showNotification(`Added ${returnedPerson.name}`)
      })
      .catch(() => {
        showNotification(`Failed to add ${personObject.name}`, 'error')
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
        showNotification(`Deleted ${name}`)
      })
      .catch(() => {
        showNotification(
          `Information of ${name} has already been removed from server`,
          'error'
        )
        setPersons(currentPersons => currentPersons.filter(person => person.id !== id))
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
      <Notification message={notificationMessage} type={notificationType} />
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
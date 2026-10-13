import React from 'react'

const Persons = ({ personsToShow }) => {
  return (
    <ul>
      {personsToShow.map(person => (
        <li key={person.name}>
          {person.name} {person.number}
        </li>
      ))}
    </ul>
  )
}

export default Persons

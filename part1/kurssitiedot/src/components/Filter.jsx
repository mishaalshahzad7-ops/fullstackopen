import React from 'react'

const Filter = ({ searchFilter, handleSearchChange }) => {
  return (
    <div>
      filter shown with <input value={searchFilter} onChange={handleSearchChange} />
    </div>
  )
}

export default Filter

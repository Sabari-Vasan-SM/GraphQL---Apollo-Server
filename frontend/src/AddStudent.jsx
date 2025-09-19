import React, { useState } from 'react'
import { useMutation, gql } from '@apollo/client'

const ADD_STUDENT = gql`
  mutation AddStudent($name: String!, $age: Int!, $course: String!) {
    addStudent(name: $name, age: $age, course: $course) {
      id
      name
      course
    }
  }
`

export default function AddStudent() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [course, setCourse] = useState('')

  const [addStudent, { loading, error }] = useMutation(ADD_STUDENT, {
    refetchQueries: ['GetStudents'], // refresh list after add
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addStudent({ variables: { name, age: parseInt(age), course } })
    setName('')
    setAge('')
    setCourse('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <input
        placeholder="Course"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />
      <button type="submit" disabled={loading}>Add Student</button>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </form>
  )
}

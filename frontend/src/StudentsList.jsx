import React from 'react'
import { useQuery, gql } from '@apollo/client'

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      id
      name
      age
      course
    }
  }
`

export default function StudentsList() {
  const { loading, error, data } = useQuery(GET_STUDENTS)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div>
      <h2>Students</h2>
      <ul>
        {data.students.map((s) => (
          <li key={s.id}>
            {s.name} — {s.course} (age {s.age})
          </li>
        ))}
      </ul>
    </div>
  )
}

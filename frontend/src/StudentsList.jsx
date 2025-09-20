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
  console.log('StudentsList component rendering');
  
  const { loading, error, data } = useQuery(GET_STUDENTS)

  console.log('Query state:', { loading, error, data });

  if (loading) return (
    <div>
      <h2>📚 Students</h2>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    </div>
  )
  
  if (error) {
    console.error('GraphQL Error:', error);
    return (
      <div>
        <h2>📚 Students</h2>
        <div className="error-container">
          <p className="error-message">❌ Error: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2>📚 Students ({data.students.length})</h2>
      {data.students.length === 0 ? (
        <div className="empty-state">
          <p>No students yet. Add your first student!</p>
        </div>
      ) : (
        <div className="students-grid">
          {data.students.map((student, index) => (
            <div key={student.id} className="student-card slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="student-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="student-info">
                <h3 className="student-name">{student.name}</h3>
                <p className="student-course">{student.course}</p>
                <span className="student-age">Age: {student.age}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

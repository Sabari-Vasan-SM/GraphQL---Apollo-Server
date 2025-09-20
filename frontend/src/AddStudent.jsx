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
  const [showSuccess, setShowSuccess] = useState(false)

  const [addStudent, { loading, error }] = useMutation(ADD_STUDENT, {
    refetchQueries: ['GetStudents'],
    onCompleted: () => {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !age || !course.trim()) {
      return
    }
    
    try {
      await addStudent({ variables: { name: name.trim(), age: parseInt(age), course: course.trim() } })
      setName('')
      setAge('')
      setCourse('')
    } catch (err) {
      console.error('Error adding student:', err)
    }
  }

  const isFormValid = name.trim() && age && course.trim()

  return (
    <div>
      <h2>➕ Add New Student</h2>
      
      {showSuccess && (
        <div className="success-message fade-in">
          ✅ Student added successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="add-student-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter student's full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="1"
            max="100"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="course">Course</label>
          <input
            id="course"
            type="text"
            placeholder="Enter course name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !isFormValid}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Adding...' : 'Add Student'}
        </button>
        
        {error && (
          <div className="error-message fade-in">
            ❌ Error: {error.message}
          </div>
        )}
      </form>
    </div>
  )
}

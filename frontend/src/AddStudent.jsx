import React, { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import Toast from './components/Toast'
import { CONFIG } from './config/constants'

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
  const [toast, setToast] = useState(null)

  const [addStudent, { loading, error }] = useMutation(ADD_STUDENT, {
    refetchQueries: ['GetStudents'],
    onCompleted: () => {
      setToast({ message: CONFIG.MESSAGES.STUDENT_ADDED, type: 'success' });
    },
    onError: (error) => {
      setToast({ message: `Error: ${error.message}`, type: 'error' });
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim()) {
      setToast({ message: 'Name is required', type: 'error' });
      return;
    }
    if (!age || age < CONFIG.UI.MIN_AGE || age > CONFIG.UI.MAX_AGE) {
      setToast({ message: `Age must be between ${CONFIG.UI.MIN_AGE} and ${CONFIG.UI.MAX_AGE}`, type: 'error' });
      return;
    }
    if (!course.trim()) {
      setToast({ message: 'Course is required', type: 'error' });
      return;
    }
    if (name.length > CONFIG.UI.MAX_NAME_LENGTH) {
      setToast({ message: `Name must be less than ${CONFIG.UI.MAX_NAME_LENGTH} characters`, type: 'error' });
      return;
    }
    if (course.length > CONFIG.UI.MAX_COURSE_LENGTH) {
      setToast({ message: `Course must be less than ${CONFIG.UI.MAX_COURSE_LENGTH} characters`, type: 'error' });
      return;
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
      
      <form onSubmit={handleSubmit} className="add-student-form">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            type="text"
            placeholder="Enter student's full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={CONFIG.UI.MAX_NAME_LENGTH}
            required
          />
          <small className="field-hint">{name.length}/{CONFIG.UI.MAX_NAME_LENGTH} characters</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Age *</label>
          <input
            id="age"
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={CONFIG.UI.MIN_AGE}
            max={CONFIG.UI.MAX_AGE}
            required
          />
          <small className="field-hint">Age between {CONFIG.UI.MIN_AGE} and {CONFIG.UI.MAX_AGE}</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="course">Course *</label>
          <input
            id="course"
            type="text"
            placeholder="Enter course name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            maxLength={CONFIG.UI.MAX_COURSE_LENGTH}
            required
          />
          <small className="field-hint">{course.length}/{CONFIG.UI.MAX_COURSE_LENGTH} characters</small>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !isFormValid}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Adding...' : 'Add Student'}
        </button>
      </form>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

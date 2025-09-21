import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import LoadingSpinner from './components/LoadingSpinner'
import Toast from './components/Toast'
import EditStudentModal from './components/EditStudentModal'
import { CONFIG } from './config/constants'

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

const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id)
  }
`

export default function StudentsList() {
  console.log('StudentsList component rendering');
  const [toast, setToast] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const { loading, error, data } = useQuery(GET_STUDENTS)
  const [deleteStudent] = useMutation(DELETE_STUDENT, {
    refetchQueries: ['GetStudents'],
    onCompleted: () => {
      setToast({ message: CONFIG.MESSAGES.STUDENT_DELETED, type: 'success' });
    },
    onError: (error) => {
      setToast({ message: `Error: ${error.message}`, type: 'error' });
    }
  });

  console.log('Query state:', { loading, error, data });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteStudent({ variables: { id } });
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  if (loading) return (
    <div>
      <h2>📚 Students</h2>
      <LoadingSpinner message="Loading students..." />
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
          <p>{CONFIG.MESSAGES.NO_STUDENTS}</p>
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
              <div className="student-actions">
                <button 
                  className="btn-edit"
                  onClick={() => setEditingStudent(student)}
                  title="Edit Student"
                >
                  ✏️
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(student.id, student.name)}
                  title="Delete Student"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <EditStudentModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
      />
    </div>
  )
}

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import Toast from './Toast';
import { CONFIG } from '../config/constants';

const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $name: String, $age: Int, $course: String) {
    updateStudent(id: $id, name: $name, age: $age, course: $course) {
      id
      name
      age
      course
    }
  }
`;

const EditStudentModal = ({ student, isOpen, onClose }) => {
  const [name, setName] = useState(student?.name || '');
  const [age, setAge] = useState(student?.age || '');
  const [course, setCourse] = useState(student?.course || '');
  const [toast, setToast] = useState(null);

  const [updateStudent, { loading }] = useMutation(UPDATE_STUDENT, {
    refetchQueries: ['GetStudents'],
    onCompleted: () => {
      setToast({ message: CONFIG.MESSAGES.STUDENT_UPDATED, type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (error) => {
      setToast({ message: `Error: ${error.message}`, type: 'error' });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    try {
      await updateStudent({
        variables: {
          id: student.id,
          name: name.trim(),
          age: parseInt(age),
          course: course.trim()
        }
      });
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>✏️ Edit Student</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="edit-name">Full Name *</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={CONFIG.UI.MAX_NAME_LENGTH}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-age">Age *</label>
            <input
              id="edit-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={CONFIG.UI.MIN_AGE}
              max={CONFIG.UI.MAX_AGE}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-course">Course *</label>
            <input
              id="edit-course"
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              maxLength={CONFIG.UI.MAX_COURSE_LENGTH}
              required
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`btn-save ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default EditStudentModal;
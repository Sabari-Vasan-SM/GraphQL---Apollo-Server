import React from 'react'
import StudentsList from './StudentsList'
import AddStudent from './AddStudent'

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>🎓 Student Manager</h1>
      <AddStudent />
      <StudentsList />
    </div>
  )
}

import React from 'react'
import './App.css'
import StudentsList from './StudentsList'
import AddStudent from './AddStudent'

export default function App() {
  console.log('App component rendering');
  
  return (
    <div style={{ padding: 20 }}>
      <h1>🎓 Student Manager</h1>
      <AddStudent />
      <StudentsList />
    </div>
  )
}
